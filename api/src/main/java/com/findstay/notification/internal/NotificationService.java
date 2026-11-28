package com.findstay.notification.internal;

import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.notification.internal.NotificationAdapters.EmailProviderAdapter;
import com.findstay.notification.internal.NotificationAdapters.SmsProviderAdapter;
import com.findstay.notification.internal.NotificationDtos.NotificationItemResponse;
import com.findstay.notification.internal.NotificationDtos.NotificationListResponse;
import com.findstay.notification.internal.NotificationDtos.PreferenceItem;
import com.findstay.notification.internal.NotificationDtos.PreferencesResponse;
import com.findstay.notification.internal.NotificationDtos.ReadAllResponse;
import com.findstay.notification.internal.NotificationDtos.UpdatePreferencesRequest;
import com.findstay.shared.error.AppException;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.job.BackgroundJobs;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Core notification dispatcher, retry processor, and inbox/preference service ({@code S1-10-T3},
 * {@code S1-10-T5}). Supports swappable email/SMS adapters and graceful SMS fallback when the
 * SMS channel is disabled.
 */
@Service
class NotificationService implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    static final int MAX_ATTEMPTS = 3;
    private static final List<Duration> RETRY_BACKOFFS = List.of(
            Duration.ofMinutes(1),
            Duration.ofMinutes(5),
            Duration.ofMinutes(15));

    private final NotificationRepository notifications;
    private final NotificationTemplateRepository templates;
    private final NotificationPreferenceRepository preferences;
    private final NotificationDeliveryRepository deliveries;
    private final EmailProviderAdapter emailAdapter;
    private final SmsProviderAdapter smsAdapter;
    private final BackgroundJobs backgroundJobs;
    private final IdGenerator idGenerator;
    private final Clock clock;
    private final boolean smsEnabled;
    private final boolean retrySchedulerEnabled;

    NotificationService(
            NotificationRepository notifications,
            NotificationTemplateRepository templates,
            NotificationPreferenceRepository preferences,
            NotificationDeliveryRepository deliveries,
            EmailProviderAdapter emailAdapter,
            SmsProviderAdapter smsAdapter,
            BackgroundJobs backgroundJobs,
            IdGenerator idGenerator,
            Clock clock,
            @Value("${findstay.notifications.sms.enabled:false}") boolean smsEnabled,
            @Value("${findstay.notifications.retry-scheduler-enabled:false}") boolean retrySchedulerEnabled) {
        this.notifications = notifications;
        this.templates = templates;
        this.preferences = preferences;
        this.deliveries = deliveries;
        this.emailAdapter = emailAdapter;
        this.smsAdapter = smsAdapter;
        this.backgroundJobs = backgroundJobs;
        this.idGenerator = idGenerator;
        this.clock = clock;
        this.smsEnabled = smsEnabled;
        this.retrySchedulerEnabled = retrySchedulerEnabled;
    }

    @PostConstruct
    void scheduleRetries() {
        if (retrySchedulerEnabled) {
            backgroundJobs.runEvery("notification-delivery-retries", Duration.ofMinutes(1), this::processDueRetries);
        }
    }

    @Override
    @Transactional
    public UUID send(NotificationRequest request) {
        Instant now = clock.instant();
        Map<String, Object> vars = request.variables() == null ? Map.of() : request.variables();
        Map<String, Object> dataPayload = new LinkedHashMap<>();
        if (request.data() != null) {
            dataPayload.putAll(request.data());
        }
        if (request.recipientEmail() != null && !request.recipientEmail().isBlank()) {
            dataPayload.put("_recipientEmail", request.recipientEmail().trim());
        }
        if (request.recipientPhone() != null && !request.recipientPhone().isBlank()) {
            dataPayload.put("_recipientPhone", request.recipientPhone().trim());
        }

        // 1. Render and persist in-app inbox row (also anchors outbound delivery FK).
        RenderedContent inApp = renderChannel(request.eventType(), "IN_APP", vars,
                request.fallbackTitle(), request.fallbackBody());
        Notification saved = new Notification(
                idGenerator.newId(),
                request.recipientId(),
                request.eventType(),
                inApp.title(),
                inApp.body(),
                dataPayload.isEmpty() ? null : dataPayload,
                now);
        notifications.saveAndFlush(saved);

        // 2. Dispatch EMAIL if enabled for this user & recipientEmail is available.
        if (isChannelEnabled(request.recipientId(), request.eventType(), NotificationDelivery.CHANNEL_EMAIL, true)
                && request.recipientEmail() != null && !request.recipientEmail().isBlank()) {
            RenderedContent emailContent = renderChannel(request.eventType(), NotificationDelivery.CHANNEL_EMAIL,
                    vars, inApp.title(), inApp.body());
            dispatchOutbound(saved.getId(), NotificationDelivery.CHANNEL_EMAIL,
                    request.recipientEmail().trim(), emailContent, now);
        }

        // 3. Dispatch SMS only when SMS channel is enabled (otherwise graceful fallback to In-App + Email).
        if (smsEnabled
                && isChannelEnabled(request.recipientId(), request.eventType(), NotificationDelivery.CHANNEL_SMS, true)
                && request.recipientPhone() != null && !request.recipientPhone().isBlank()) {
            RenderedContent smsContent = renderChannel(request.eventType(), NotificationDelivery.CHANNEL_SMS,
                    vars, inApp.title(), inApp.body());
            dispatchOutbound(saved.getId(), NotificationDelivery.CHANNEL_SMS,
                    request.recipientPhone().trim(), smsContent, now);
        }

        return saved.getId();
    }

    @Transactional
    int processDueRetries() {
        Instant now = clock.instant();
        List<NotificationDelivery> due = deliveries
                .findByStatusAndAttemptsLessThanAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(
                        NotificationDelivery.STATUS_FAILED, MAX_ATTEMPTS, now);
        int processed = 0;
        for (NotificationDelivery delivery : due) {
            Optional<Notification> notifOpt = notifications.findById(delivery.getNotificationId());
            if (notifOpt.isEmpty()) {
                continue;
            }
            Notification notif = notifOpt.get();
            Map<String, Object> data = notif.getData() == null ? Map.of() : notif.getData();
            String target = NotificationDelivery.CHANNEL_EMAIL.equals(delivery.getChannel())
                    ? asString(data.get("_recipientEmail"))
                    : asString(data.get("_recipientPhone"));
            if (target == null || target.isBlank()) {
                delivery.recordFailure("Missing recipient address for retry", null, now);
                deliveries.saveAndFlush(delivery);
                processed++;
                continue;
            }
            RenderedContent content = renderChannel(
                    notif.getEventType(), delivery.getChannel(), data, notif.getTitle(), notif.getBody());
            attemptDelivery(delivery, target, content, now);
            processed++;
        }
        return processed;
    }

    @Transactional(readOnly = true)
    NotificationListResponse getInbox(UUID userId, int limit, int offset) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        int safeOffset = Math.max(0, offset);
        int page = safeOffset / safeLimit;
        List<Notification> rows = notifications.findByUserIdOrderByCreatedAtDesc(
                userId, PageRequest.of(page, safeLimit));
        long unreadCount = notifications.countByUserIdAndReadAtIsNull(userId);
        long total = notifications.countByUserId(userId);
        return new NotificationListResponse(
                rows.stream().map(NotificationService::toItemResponse).toList(),
                unreadCount,
                total,
                safeLimit,
                safeOffset);
    }

    @Transactional
    NotificationItemResponse markAsRead(UUID userId, UUID notificationId) {
        Notification notification = notifications.findByIdAndUserId(notificationId, userId)
                .orElseThrow(() -> AppException.notFound("Notification", notificationId));
        notification.markRead(clock.instant());
        notifications.saveAndFlush(notification);
        return toItemResponse(notification);
    }

    @Transactional
    ReadAllResponse markAllAsRead(UUID userId) {
        int updated = notifications.markAllReadForUser(userId, clock.instant());
        long remaining = notifications.countByUserIdAndReadAtIsNull(userId);
        return new ReadAllResponse(updated, remaining);
    }

    @Transactional(readOnly = true)
    PreferencesResponse getPreferences(UUID userId) {
        Map<String, Boolean> overrides = new HashMap<>();
        for (NotificationPreference pref : preferences.findByUserIdOrderByEventTypeAscChannelAsc(userId)) {
            overrides.put(pref.getEventType() + "|" + pref.getChannel(), pref.isEnabled());
        }

        List<NotificationTemplate> seeded = templates.findByActiveTrueOrderByEventTypeAscChannelAsc();
        Map<String, PreferenceItem> merged = new LinkedHashMap<>();
        for (NotificationTemplate tpl : seeded) {
            String key = tpl.getEventType() + "|" + tpl.getChannel();
            boolean defaultEnabled = !"SMS".equals(tpl.getChannel()) || smsEnabled;
            boolean enabled = overrides.getOrDefault(key, defaultEnabled);
            merged.put(key, new PreferenceItem(tpl.getEventType(), tpl.getChannel(), enabled));
        }
        // Include any user-saved overrides for custom event types not in template table
        for (NotificationPreference pref : preferences.findByUserIdOrderByEventTypeAscChannelAsc(userId)) {
            String key = pref.getEventType() + "|" + pref.getChannel();
            merged.putIfAbsent(key, new PreferenceItem(pref.getEventType(), pref.getChannel(), pref.isEnabled()));
        }

        return new PreferencesResponse(new ArrayList<>(merged.values()), smsEnabled);
    }

    @Transactional
    PreferencesResponse updatePreferences(UUID userId, UpdatePreferencesRequest request) {
        Instant now = clock.instant();
        for (PreferenceItem item : request.preferences()) {
            String eventType = item.eventType().trim();
            String channel = item.channel().trim();
            boolean enabled = Boolean.TRUE.equals(item.enabled());
            NotificationPreference existing = preferences
                    .findByUserIdAndEventTypeAndChannel(userId, eventType, channel)
                    .orElseGet(() -> new NotificationPreference(
                            idGenerator.newId(), userId, eventType, channel, enabled, now));
            existing.setEnabled(enabled, now);
            preferences.save(existing);
        }
        preferences.flush();
        return getPreferences(userId);
    }

    private void dispatchOutbound(
            UUID notificationId,
            String channel,
            String target,
            RenderedContent content,
            Instant now) {
        NotificationDelivery delivery = new NotificationDelivery(idGenerator.newId(), notificationId, channel, now);
        deliveries.saveAndFlush(delivery);
        attemptDelivery(delivery, target, content, now);
    }

    private void attemptDelivery(
            NotificationDelivery delivery,
            String target,
            RenderedContent content,
            Instant now) {
        try {
            String messageId = NotificationDelivery.CHANNEL_EMAIL.equals(delivery.getChannel())
                    ? emailAdapter.sendEmail(target, content.title(), content.body())
                    : smsAdapter.sendSms(target, content.body());
            delivery.recordSuccess(messageId, now);
        } catch (Exception ex) {
            int nextAttemptIndex = delivery.getAttempts();
            Instant nextRetry = (delivery.getAttempts() + 1 < MAX_ATTEMPTS)
                    ? now.plus(RETRY_BACKOFFS.get(Math.min(nextAttemptIndex, RETRY_BACKOFFS.size() - 1)))
                    : null;
            log.warn("Notification delivery failed [deliveryId={}, channel={}, attempt={}, error={}]",
                    delivery.getId(), delivery.getChannel(), delivery.getAttempts() + 1, ex.getMessage());
            delivery.recordFailure(ex.getMessage() == null ? ex.getClass().getSimpleName() : ex.getMessage(),
                    nextRetry, now);
        }
        deliveries.saveAndFlush(delivery);
    }

    private boolean isChannelEnabled(UUID userId, String eventType, String channel, boolean defaultValue) {
        return preferences.findByUserIdAndEventTypeAndChannel(userId, eventType, channel)
                .map(NotificationPreference::isEnabled)
                .orElse(defaultValue);
    }

    private RenderedContent renderChannel(
            String eventType,
            String channel,
            Map<String, Object> vars,
            String fallbackTitle,
            String fallbackBody) {
        Optional<NotificationTemplate> tplOpt =
                templates.findByEventTypeAndChannelAndActiveTrue(eventType, channel);
        if (tplOpt.isPresent()) {
            NotificationTemplate tpl = tplOpt.get();
            String title = TemplateRenderer.render(tpl.getTitleTemplate(), vars);
            String body = TemplateRenderer.render(tpl.getBodyTemplate(), vars);
            return new RenderedContent(
                    title.isEmpty() ? fallbackTitle : title,
                    body.isEmpty() ? fallbackBody : body);
        }
        return new RenderedContent(
                TemplateRenderer.render(fallbackTitle, vars),
                TemplateRenderer.render(fallbackBody, vars));
    }

    private static NotificationItemResponse toItemResponse(Notification n) {
        Map<String, Object> publicData = null;
        if (n.getData() != null) {
            Map<String, Object> filtered = new LinkedHashMap<>();
            n.getData().forEach((k, v) -> {
                if (!k.startsWith("_")) {
                    filtered.put(k, v);
                }
            });
            if (!filtered.isEmpty()) {
                publicData = filtered;
            }
        }
        return new NotificationItemResponse(
                n.getId(),
                n.getEventType(),
                n.getTitle(),
                n.getBody(),
                publicData,
                n.getReadAt(),
                n.getCreatedAt());
    }

    private static String asString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private record RenderedContent(String title, String body) {
    }
}
