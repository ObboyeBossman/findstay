package com.findstay.audit.api;

/**
 * Extension Seam 5 — Activity Log Seam ({@code docs/rules/module-boundaries.md}, {@code S1-08-T3}).
 *
 * <p>Shared append-only audit trail API injected by any FindStay module to record sensitive
 * administrative, verification, listing, availability, or account actions. Audit entries are
 * immutable: no update or delete operation exists.
 */
public interface AuditRecorder {

    /** Appends an immutable audit entry with a generated UUIDv7 and UTC timestamp. */
    AuditEntryView record(AuditRecord entry);

    /** Searches the append-only audit trail newest-first with optional filters. */
    AuditPageView search(AuditQuery query);
}
