package com.findstay.audit.internal;

import org.springframework.data.repository.Repository;
import java.util.UUID;

interface AuditLogRepository extends Repository<AuditLogEntity, UUID> {
    AuditLogEntity save(AuditLogEntity entity);
}
