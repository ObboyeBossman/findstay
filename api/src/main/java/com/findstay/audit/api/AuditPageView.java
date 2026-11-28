package com.findstay.audit.api;

import java.util.List;

/**
 * Paginated response envelope for admin audit trail queries ({@code S1-08-T4}).
 */
public record AuditPageView(
        List<AuditEntryView> items,
        long total,
        int limit,
        int offset
) {
}
