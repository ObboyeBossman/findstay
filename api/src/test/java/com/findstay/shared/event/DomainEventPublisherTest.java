package com.findstay.shared.event;

import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.id.UuidV7Generator;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DomainEventPublisherTest {

    record OrderPlaced(EventMeta meta, UUID orderId) implements DomainEvent {
    }

    private static final Instant NOW = Instant.parse("2026-11-15T21:17:00Z");

    private final List<Object> published = new ArrayList<>();
    private final Clock clock = Clock.fixed(NOW, ZoneOffset.UTC);
    private final IdGenerator ids = new UuidV7Generator(clock);
    private final DomainEventPublisher publisher = new DomainEventPublisher(published::add, ids, clock);

    @Test
    void newMetaHasAUniqueIdAndTheCurrentUtcTime() {
        EventMeta first = publisher.newMeta();
        EventMeta second = publisher.newMeta();
        assertThat(first.occurredAt()).isEqualTo(NOW);
        assertThat(first.eventId()).isNotEqualTo(second.eventId());
    }

    @Test
    void publishedEventsReachTheSpringEventBus() {
        UUID orderId = UUID.randomUUID();
        OrderPlaced event = new OrderPlaced(publisher.newMeta(), orderId);

        publisher.publish(event);

        assertThat(published).containsExactly(event);
        assertThat(event.eventId()).isEqualTo(event.meta().eventId());
        assertThat(event.occurredAt()).isEqualTo(NOW);
    }

    @Test
    void nullEventsAreRejected() {
        assertThatThrownBy(() -> publisher.publish(null)).isInstanceOf(NullPointerException.class);
        assertThat(published).isEmpty();
    }
}
