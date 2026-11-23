package com.findstay.notification.internal;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.findstay.notification.api.NotificationRequest;
import com.findstay.notification.api.NotificationSender;
import com.findstay.shared.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;

@Service
@Transactional
public class NotificationService implements NotificationSender {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private static final List<String> DEFAULT_EVENT_TYPES = List.of(
            "VERIFICATION_STATUS_CHANGED",
            "LISTING_STATUS_CHANGED",
            "ACCOUNT_ACTIVITY"
    );

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final ObjectMapper objectMapper;

    public NotificationService(
            NotificationRepository notificationRepository,
            NotificationPreferenceRepository preferenceRepository,
            ObjectMapper objectMapper) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
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
        // Enforce strict cross-user isolation per NFR-24.
        // If notification does not belong to the caller, return 404 (not found).
        Notification notification = notificationRepository
                .findByIdAndRecipientId(notificationId, callerId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (notification.getReadAt() == null) {
            notification.setReadAt(Instant.now());
            notification = notificationRepository.save(notification);
        }

        return NotificationResponse.from(notification);
    }

    public NotificationReadAllResponse markAllAsRead(UUID callerId) {
        int updated = notificationRepository.markAllAsRead(callerId, Instant.now());
        return new NotificationReadAllResponse(updated);
    }

    @Transactional(readOnly = true)
    public NotificationPreferencesResponse getPreferences(UUID callerId) {
        List<NotificationPreference> userPrefs = preferenceRepository.findByUserIdOrderByEventTypeAsc(callerId);

        if (userPrefs.isEmpty()) {
            // Return defaults if none explicitly saved yet
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
            pref.setUpdatedAt(Instant.now());

            NotificationPreference saved = preferenceRepository.save(pref);
            updatedDtos.add(NotificationPreferenceDto.from(saved));
        }

        return new NotificationPreferencesResponse(updatedDtos);
    }

    @Override
    public void send(NotificationRequest request) {
        log.info("Dispatching notification to recipient={}, eventType={}", request.recipientId(), request.eventType());

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
                request.title(),
                request.message(),
                jsonPayload
        );

        notificationRepository.save(notification);
    }
}
