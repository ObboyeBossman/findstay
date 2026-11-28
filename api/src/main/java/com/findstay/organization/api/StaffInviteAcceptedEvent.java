package com.findstay.organization.api;

import com.findstay.shared.event.DomainEvent;
import com.findstay.shared.event.EventMeta;

import java.util.Set;
import java.util.UUID;

/**
 * Emitted when an invited staff member accepts an organisation invitation ({@code S1-07-T4}).
 * Consumers (such as {@code identity} for role promotion or {@code notification} for alerts)
 * react without introducing cross-module JPA coupling.
 */
public record StaffInviteAcceptedEvent(
        EventMeta meta,
        UUID userId,
        UUID organizationId,
        Set<UUID> propertyIds
) implements DomainEvent {
}
