package com.findstay.shared.event;

import java.time.Instant;
import java.util.UUID;

/**
 * Something that happened in one module that other modules may react to.
 * Declare events as immutable records that carry an {@link EventMeta}:
 *
 * <pre>
 * public record OrderPlaced(EventMeta meta, UUID orderId, Money total) implements DomainEvent { }
 * </pre>
 *
 * Publish with {@link DomainEventPublisher}; listen in other modules with
 * {@code @ApplicationModuleListener} (Spring Modulith) or {@code @EventListener}.
 * Name events in the past tense, and keep them free of entities, so modules stay decoupled.
 */
public interface DomainEvent {

    EventMeta meta();

    default UUID eventId() {
        return meta().eventId();
    }

    default Instant occurredAt() {
        return meta().occurredAt();
    }
}
