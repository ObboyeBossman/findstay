package com.findstay.notification.internal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

interface NotificationTemplateRepository extends JpaRepository<NotificationTemplate, UUID> {

    Optional<NotificationTemplate> findByEventTypeAndChannelAndActiveTrue(String eventType, String channel);

    List<NotificationTemplate> findByActiveTrueOrderByEventTypeAscChannelAsc();
}
