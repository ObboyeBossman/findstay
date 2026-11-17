package com.findstay.shared.event;

import java.time.Instant;
import java.util.UUID;

/** Identity and timing every domain event carries: a unique id and when it happened (UTC). */
public record EventMeta(UUID eventId, Instant occurredAt) {
}
