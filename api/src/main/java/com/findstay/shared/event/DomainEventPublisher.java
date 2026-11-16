package com.findstay.shared.event;

import com.findstay.shared.id.IdGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.util.Objects;

/** The way feature modules announce domain events. */
@Component
public class DomainEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(DomainEventPublisher.class);

    private final ApplicationEventPublisher publisher;
    private final IdGenerator ids;
    private final Clock clock;

    public DomainEventPublisher(ApplicationEventPublisher publisher, IdGenerator ids, Clock clock) {
        this.publisher = publisher;
        this.ids = ids;
        this.clock = clock;
    }

    /** Fresh id and UTC timestamp for a new event. */
    public EventMeta newMeta() {
        return new EventMeta(ids.newId(), clock.instant());
    }

    public void publish(DomainEvent event) {
        Objects.requireNonNull(event, "event");
        log.debug("Publishing {} {}", event.getClass().getSimpleName(), event.eventId());
        publisher.publishEvent(event);
    }
}
