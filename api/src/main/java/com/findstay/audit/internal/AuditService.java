package com.findstay.audit.internal;

import com.findstay.audit.api.AuditActorNameProvider;
import com.findstay.audit.api.AuditEntryView;
import com.findstay.audit.api.AuditPageView;
import com.findstay.audit.api.AuditQuery;
import com.findstay.audit.api.AuditRecord;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.shared.error.ApiError;
import com.findstay.shared.error.AppException;
import com.findstay.shared.id.IdGenerator;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Append-only audit recorder and paginated search service ({@code S1-08-T3}, {@code S1-08-T4}).
 */
@Service
class AuditService implements AuditRecorder {

    private final AuditLogRepository auditLogRepository;
    private final EntityManager entityManager;
    private final ObjectProvider<AuditActorNameProvider> actorNameProvider;
    private final IdGenerator idGenerator;
    private final Clock clock;

    AuditService(
            AuditLogRepository auditLogRepository,
            EntityManager entityManager,
            ObjectProvider<AuditActorNameProvider> actorNameProvider,
            IdGenerator idGenerator,
            Clock clock
    ) {
        this.auditLogRepository = auditLogRepository;
        this.entityManager = entityManager;
        this.actorNameProvider = actorNameProvider;
        this.idGenerator = idGenerator;
        this.clock = clock;
    }

    @Override
    @Transactional
    public AuditEntryView record(AuditRecord entry) {
        if (entry == null) {
            throw new IllegalArgumentException("AuditRecord must not be null");
        }
        List<ApiError.Detail> errors = new ArrayList<>();
        if (entry.actorId() == null) {
            errors.add(new ApiError.Detail("actorId", "Actor ID is required"));
        }
        if (entry.action() == null || entry.action().isBlank()) {
            errors.add(new ApiError.Detail("action", "Action code is required"));
        }
        if (entry.entityType() == null || entry.entityType().isBlank()) {
            errors.add(new ApiError.Detail("entityType", "Entity type is required"));
        }
        if (entry.entityId() == null || entry.entityId().isBlank()) {
            errors.add(new ApiError.Detail("entityId", "Entity ID is required"));
        }
        if (!errors.isEmpty()) {
            throw AppException.validation("Audit record is missing mandatory fields", errors);
        }

        Instant now = clock.instant();
        AuditLog saved = auditLogRepository.save(new AuditLog(
                idGenerator.newId(),
                entry.actorId(),
                entry.orgId(),
                truncate(entry.action().trim(), 64),
                truncate(entry.entityType().trim(), 64),
                truncate(entry.entityId().trim(), 64),
                entry.metadata(),
                now
        ));
        entityManager.flush();

        Map<UUID, String> names = resolveActorNames(Set.of(saved.getActorId()));
        return toView(saved, names.get(saved.getActorId()));
    }

    @Override
    @Transactional(readOnly = true)
    public AuditPageView search(AuditQuery query) {
        AuditQuery effective = query != null
                ? query
                : new AuditQuery(null, null, null, null, null, null, null, AuditQuery.DEFAULT_LIMIT, 0);

        if (effective.from() != null && effective.to() != null && effective.to().isBefore(effective.from())) {
            throw AppException.validation(
                    "Invalid audit date range",
                    List.of(new ApiError.Detail("to", "End timestamp must be on or after start timestamp"))
            );
        }

        CriteriaBuilder cb = entityManager.getCriteriaBuilder();

        // Count query
        CriteriaQuery<Long> countCq = cb.createQuery(Long.class);
        Root<AuditLog> countRoot = countCq.from(AuditLog.class);
        countCq.select(cb.count(countRoot));
        List<Predicate> countPredicates = buildPredicates(cb, countRoot, effective);
        if (!countPredicates.isEmpty()) {
            countCq.where(countPredicates.toArray(Predicate[]::new));
        }
        long total = entityManager.createQuery(countCq).getSingleResult();

        if (total == 0) {
            return new AuditPageView(List.of(), 0, effective.limit(), effective.offset());
        }

        // Data query (newest first, tie-break by UUIDv7 id DESC)
        CriteriaQuery<AuditLog> dataCq = cb.createQuery(AuditLog.class);
        Root<AuditLog> dataRoot = dataCq.from(AuditLog.class);
        List<Predicate> dataPredicates = buildPredicates(cb, dataRoot, effective);
        if (!dataPredicates.isEmpty()) {
            dataCq.where(dataPredicates.toArray(Predicate[]::new));
        }
        dataCq.orderBy(cb.desc(dataRoot.get("createdAt")), cb.desc(dataRoot.get("id")));

        TypedQuery<AuditLog> typedQuery = entityManager.createQuery(dataCq);
        typedQuery.setFirstResult(effective.offset());
        typedQuery.setMaxResults(effective.limit());
        List<AuditLog> rows = typedQuery.getResultList();

        Set<UUID> actorIds = rows.stream().map(AuditLog::getActorId).collect(Collectors.toSet());
        Map<UUID, String> names = resolveActorNames(actorIds);

        List<AuditEntryView> items = rows.stream()
                .map(row -> toView(row, names.get(row.getActorId())))
                .toList();

        return new AuditPageView(items, total, effective.limit(), effective.offset());
    }

    private List<Predicate> buildPredicates(CriteriaBuilder cb, Root<AuditLog> root, AuditQuery query) {
        List<Predicate> predicates = new ArrayList<>();
        if (query.actorId() != null) {
            predicates.add(cb.equal(root.get("actorId"), query.actorId()));
        }
        if (query.orgId() != null) {
            predicates.add(cb.equal(root.get("orgId"), query.orgId()));
        }
        if (query.action() != null && !query.action().isBlank()) {
            predicates.add(cb.equal(cb.lower(root.get("action")), query.action().trim().toLowerCase()));
        }
        if (query.entityType() != null && !query.entityType().isBlank()) {
            predicates.add(cb.equal(cb.lower(root.get("entityType")), query.entityType().trim().toLowerCase()));
        }
        if (query.entityId() != null && !query.entityId().isBlank()) {
            predicates.add(cb.equal(root.get("entityId"), query.entityId().trim()));
        }
        if (query.from() != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), query.from()));
        }
        if (query.to() != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), query.to()));
        }
        return predicates;
    }

    private Map<UUID, String> resolveActorNames(Set<UUID> actorIds) {
        if (actorIds == null || actorIds.isEmpty()) {
            return Map.of();
        }
        AuditActorNameProvider provider = actorNameProvider.getIfAvailable();
        if (provider == null) {
            return Map.of();
        }
        return provider.resolveDisplayNames(actorIds);
    }

    private static AuditEntryView toView(AuditLog log, String actorName) {
        Map<String, Object> safeMeta = log.getMetadataJson() == null
                ? Map.of()
                : Collections.unmodifiableMap(new LinkedHashMap<>(log.getMetadataJson()));
        return new AuditEntryView(
                log.getId(),
                log.getActorId(),
                actorName,
                log.getOrgId(),
                log.getAction(),
                log.getEntityType(),
                log.getEntityId(),
                safeMeta,
                log.getCreatedAt()
        );
    }

    private static String truncate(String value, int maxLen) {
        return value.length() <= maxLen ? value : value.substring(0, maxLen);
    }
}
