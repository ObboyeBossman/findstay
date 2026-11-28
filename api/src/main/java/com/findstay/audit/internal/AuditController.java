package com.findstay.audit.internal;

import com.findstay.audit.api.AuditPageView;
import com.findstay.audit.api.AuditQuery;
import com.findstay.audit.api.AuditRecorder;
import com.findstay.shared.security.RequiresPermission;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.UUID;

/**
 * Read-only administrator endpoint for browsing the permanent activity log ({@code S1-08-T4}, {@code SCR-21C}).
 */
@RestController
@RequestMapping("/api/v1/admin/audit-logs")
class AuditController {

    private final AuditRecorder auditRecorder;

    AuditController(AuditRecorder auditRecorder) {
        this.auditRecorder = auditRecorder;
    }

    @GetMapping
    @RequiresPermission("admin.audit.read")
    AuditPageView listAuditLogs(
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) UUID orgId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String entityId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "25") int limit,
            @RequestParam(defaultValue = "0") int offset
    ) {
        return auditRecorder.search(new AuditQuery(
                actorId,
                orgId,
                action,
                entityType,
                entityId,
                from,
                to,
                limit,
                offset
        ));
    }
}
