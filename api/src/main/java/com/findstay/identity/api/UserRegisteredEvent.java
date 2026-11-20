package com.findstay.identity.api;

import com.findstay.shared.event.DomainEvent;
import com.findstay.shared.event.EventMeta;

import java.util.UUID;

/**
 * Emitted when a Supabase-authenticated user is provisioned in FindStay for the first time
 * ({@code DEC-S1-01/A}, {@code S1-04}).
 */
public record UserRegisteredEvent(
        EventMeta meta,
        UUID userId,
        String email
) implements DomainEvent {
}
