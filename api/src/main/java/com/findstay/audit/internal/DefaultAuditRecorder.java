package com.findstay.audit.internal;

import com.findstay.audit.api.AuditEntry;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.shared.id.IdGenerator;
import com.findstay.shared.time.Clock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Objects;

@Service
class DefaultAuditRecorder implements AuditRecorder {

    private final AuditLogRepository repository;
    private final IdGenerator idGenerator;
    private final Clock clock;

    DefaultAuditRecorder(AuditLogRepository repository, IdGenerator idGenerator, Clock clock) {
        this.repository = repository;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional
    public void record(AuditEntry entry) {
        Objects.requireNonNull(entry, "AuditEntry must not be null");

        AuditLogEntity entity = new AuditLogEntity(
                idGenerator.nextUuidV7(), // Adjust method name to match your IdGenerator
                entry.actorId(),
                entry.orgId(),
                entry.action(),
                entry.entityType(),
                entry.entityId(),
                entry.metadata() != null ? entry.metadata() : Map.of(),
                clock.now() // Adjust method name to match your Clock
        );

        repository.save(entity);
    }
}
