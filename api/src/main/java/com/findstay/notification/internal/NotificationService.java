package com.findstay.notification.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.shared.Clock;
import com.findstay.shared.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

/**
 * Core notification service & dispatcher implementing Extension Seam 4 (NotificationSender).
 * Handles multi-channel rendering, user preference evaluation, in-app inbox storage,
 * and outbound Email/SMS delivery tracking with automated failure recording.
 */
@Service
@Transactional
public class NotificationService implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);
    private static final long INITIAL_RETRY_BACKOFF_SECONDS = 60L; // 1 minute

    private static final List<String> DEFAULT_EVENT_TYPES = List.of(
            "VERIFICATION_STATUS_CHANGED",
            "LISTING_STATUS_CHANGED",
            "ACCOUNT_ACTIVITY",
            "ORG_STAFF_INVITED"
    );

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final NotificationTemplateRepository templateRepository;
    private final NotificationDeliveryRepository deliveryRepository;
    private final EmailProviderAdapter emailProviderAdapter;
    private final SmsProviderAdapter smsProviderAdapter;
    private final TemplateRenderer templateRenderer;
    private final Clock clock;
    private final ObjectMapper objectMapper;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            NotificationTemplateRepository templateRepository,
            NotificationDeliveryRepository deliveryRepository,
            EmailProviderAdapter emailProviderAdapter,
            SmsProviderAdapter smsProviderAdapter,
            TemplateRenderer templateRenderer,
            Clock clock,
            ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.templateRepository = templateRepository;
        this.deliveryRepository = deliveryRepository;
        this.emailProviderAdapter = emailProviderAdapter;
        this.smsProviderAdapter = smsProviderAdapter;
        this.templateRenderer = templateRenderer;
        this.clock = clock;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getInbox(UUID callerId, int limit, int offset) {
        int boundedLimit = Math.min(Math.max(limit, 1), 100);
        int boundedOffset = Math.max(offset, 0);

        OffsetBasedPageRequest pageRequest = new OffsetBasedPageRequest(
                boundedOffset,
                boundedLimit,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        Page<Notification> page = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(callerId, pageRequest);
        long unreadCount = notificationRepository.countByRecipientIdAndReadAtIsNull(callerId);

        List<NotificationResponse> items = page.getContent().stream()
                .map(NotificationResponse::from)
                .toList();

        return new NotificationListResponse(items, page.getTotalElements(), unreadCount);
    }

    public NotificationResponse markAsRead(UUID callerId, UUID notificationId) {
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, callerId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(clock.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    public NotificationReadAllResponse markAllAsRead(UUID callerId) {
        int updated = notificationRepository.markAllAsRead(callerId, clock.now());
        return new NotificationReadAllResponse(updated);
    }

    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getPreferences(UUID callerId) {
        List<NotificationPreference> userPrefs = preferenceRepository.findByUserIdOrderByEventTypeAsc(callerId);

        if (userPrefs.isEmpty()) {
            List<NotificationPreferenceDto> defaults = DEFAULT_EVENT_TYPES.stream()
                    .map(eventType -> new NotificationPreferenceDto(eventType, true, false, true))
                    .toList();
            return new NotificationPreferencesResponse(defaults);
        }

        List<NotificationPreferenceDto> dtos = userPrefs.stream()
                .map(NotificationPreferenceDto::from)
                .toList();

        return new NotificationPreferencesResponse(dtos);
    }

    public NotificationPreferencesResponse updatePreferences(UUID callerId, UpdatePreferencesRequest request) {
        List<NotificationPreferenceDto> updatedDtos = new ArrayList<>();

        for (NotificationPreferenceDto dto : request.preferences()) {
            NotificationPreference pref = preferenceRepository
                    .findByUserIdAndEventType(callerId, dto.eventType())
                    .orElseGet(() -> {
                        NotificationPreference newPref = new NotificationPreference();
                        newPref.setUserId(callerId);
                        newPref.setEventType(dto.eventType());
                        return newPref;
                    });

            pref.setEmailEnabled(dto.emailEnabled());
            pref.setSmsEnabled(dto.smsEnabled());
            pref.setInAppEnabled(dto.inAppEnabled());
            pref.setUpdatedAt(clock.now());

            NotificationPreference saved = preferenceRepository.save(pref);
            updatedDtos.add(NotificationPreferenceDto.from(saved));
        }

        return new NotificationPreferencesResponse(updatedDtos);
    }

    @Transactional(readOnly = true)
    public Optional<RenderedMessage> renderTemplate(String eventType, String channel, Map<String, Object> data) {
        return templateRepository.findByEventTypeAndChannelAndActiveTrue(eventType, channel)
                .map(t -> templateRenderer.render(t, data));
    }

    @Override
    public void send(NotificationRequest request) {
        log.info("Processing notification dispatch for recipient={}, eventType={}",
                request.recipientId(), request.eventType());

        // Check user preferences
        NotificationPreference preference = preferenceRepository
                .findByUserIdAndEventType(request.recipientId(), request.eventType())
                .orElse(null);

        boolean inAppEnabled = preference == null || preference.isInAppEnabled();
        boolean emailEnabled = preference == null || preference.isEmailEnabled();
        boolean smsEnabled = preference != null && preference.isSmsEnabled();

        Notification inAppNotification = null;

        // 1. In-App Notification Delivery
        if (inAppEnabled) {
            inAppNotification = dispatchInApp(request);
        } else {
            log.debug("In-app notification skipped due to user preference for recipient={}", request.recipientId());
        }

        UUID notificationId = inAppNotification != null ? inAppNotification.getId() : null;

        // 2. Outbound Email Delivery
        if (emailEnabled) {
            dispatchEmail(request, notificationId);
        }

        // 3. Outbound SMS Delivery (with P-08 Fallback)
        if (smsEnabled) {
            dispatchSms(request, notificationId);
        }
    }

    private Notification dispatchInApp(NotificationRequest request) {
        String title = request.title();
        String message = request.message();

        Optional<NotificationTemplate> inAppTemplate = templateRepository
                .findByEventTypeAndChannelAndActiveTrue(request.eventType(), "IN_APP");

        if (inAppTemplate.isPresent()) {
            RenderedMessage rendered = templateRenderer.render(inAppTemplate.get(), request.data());
            if (title == null || title.isBlank()) {
                title = rendered.subject();
            } else {
                title = templateRenderer.render(title, request.data());
            }
            if (message == null || message.isBlank()) {
                message = rendered.body();
            } else {
                message = templateRenderer.render(message, request.data());
            }
        } else {
            if (title != null) {
                title = templateRenderer.render(title, request.data());
            }
            if (message != null) {
                message = templateRenderer.render(message, request.data());
            }
        }

        String jsonPayload = null;
        if (request.data() != null && !request.data().isEmpty()) {
            try {
                jsonPayload = objectMapper.writeValueAsString(request.data());
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize notification data payload", e);
            }
        }

        Notification notification = new Notification(
                request.recipientId(),
                request.eventType(),
                title != null ? title : request.eventType(),
                message != null ? message : "",
                jsonPayload
        );

        return notificationRepository.save(notification);
    }

    private void dispatchEmail(NotificationRequest request, UUID notificationId) {
        String email = request.recipientEmail();
        if (email == null && request.data() != null) {
            Object emailObj = request.data().get("email");
            if (emailObj != null) {
                email = String.valueOf(emailObj);
            }
        }

        if (email == null || email.isBlank()) {
            log.debug("No recipient email provided for event {}; skipping email dispatch", request.eventType());
            return;
        }

        Optional<NotificationTemplate> emailTemplate = templateRepository
                .findByEventTypeAndChannelAndActiveTrue(request.eventType(), "EMAIL");

        String subject = "FindStay Notification";
        String body = request.message() != null ? request.message() : "";

        if (emailTemplate.isPresent()) {
            RenderedMessage rendered = templateRenderer.render(emailTemplate.get(), request.data());
            subject = rendered.subject() != null ? rendered.subject() : subject;
            body = rendered.body() != null ? rendered.body() : body;
        } else if (request.title() != null) {
            subject = templateRenderer.render(request.title(), request.data());
            body = templateRenderer.render(body, request.data());
        }

        NotificationDelivery delivery = new NotificationDelivery(
                notificationId,
                request.recipientId(),
                DeliveryChannel.EMAIL,
                email,
                subject,
                body,
                3
        );
        delivery = deliveryRepository.save(delivery);

        // Attempt outbound dispatch via configured adapter
        EmailDispatchResult result = emailProviderAdapter.sendEmail(email, subject, body);
        recordDeliveryAttempt(delivery, result.success(), result.providerMessageId(), result.error());
    }

    private void dispatchSms(NotificationRequest request, UUID notificationId) {
        if (!smsProviderAdapter.isEnabled()) {
            // Settled Decision P-08: Safe email-only fallback mode when SMS is not active
            log.info("[P-08 Fallback] SMS adapter '{}' is disabled; skipping SMS dispatch for recipient={}",
                    smsProviderAdapter.providerName(), request.recipientId());
            return;
        }

        String phone = request.recipientPhone();
        if (phone == null && request.data() != null) {
            Object phoneObj = request.data().get("phone");
            if (phoneObj != null) {
                phone = String.valueOf(phoneObj);
            }
        }

        if (phone == null || phone.isBlank()) {
            log.debug("No recipient phone provided for event {}; skipping SMS dispatch", request.eventType());
            return;
        }

        Optional<NotificationTemplate> smsTemplate = templateRepository
                .findByEventTypeAndChannelAndActiveTrue(request.eventType(), "SMS");

        String message = request.message() != null ? request.message() : "";
        if (smsTemplate.isPresent()) {
            RenderedMessage rendered = templateRenderer.render(smsTemplate.get(), request.data());
            message = rendered.body() != null ? rendered.body() : message;
        } else {
            message = templateRenderer.render(message, request.data());
        }

        NotificationDelivery delivery = new NotificationDelivery(
                notificationId,
                request.recipientId(),
                DeliveryChannel.SMS,
                phone,
                null,
                message,
                3
        );
        delivery = deliveryRepository.save(delivery);

        // Attempt outbound dispatch via configured SMS adapter
        SmsDispatchResult result = smsProviderAdapter.sendSms(phone, message);
        recordDeliveryAttempt(delivery, result.success(), result.providerMessageId(), result.error());
    }

    private void recordDeliveryAttempt(NotificationDelivery delivery, boolean success, String messageId, String error) {
        Instant now = clock.now();
        delivery.setAttempts(delivery.getAttempts() + 1);
        delivery.setLastAttemptAt(now);

        if (success) {
            delivery.setStatus(DeliveryStatus.SENT);
            delivery.setProviderMessageId(messageId);
            delivery.setLastError(null);
            delivery.setNextRetryAt(null);
        } else {
            delivery.setStatus(DeliveryStatus.FAILED);
            delivery.setLastError(error);
            if (delivery.getAttempts() < delivery.getMaxAttempts()) {
                long delaySeconds = (long) Math.pow(2, delivery.getAttempts()) * INITIAL_RETRY_BACKOFF_SECONDS;
                delivery.setNextRetryAt(now.plusSeconds(delaySeconds));
            } else {
                delivery.setNextRetryAt(null);
            }
        }

        deliveryRepository.save(delivery);
    }
}
