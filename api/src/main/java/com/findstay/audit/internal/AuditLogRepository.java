package com.findstay.audit.internal;

import org.springframework.data.repository.Repository;

import java.util.UUID;

/**
 * Intentionally extends marker {@link Repository} (not {@code JpaRepository}) and exposes only
 * append-only {@code saveAndFlush} so no update/delete methods exist even in Java code.
 */
interface AuditLogRepository extends Repository<AuditLog, UUID> {

    AuditLog save(AuditLog entity);
}
