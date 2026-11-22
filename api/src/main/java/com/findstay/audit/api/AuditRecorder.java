package com.findstay.audit.api;

public interface AuditRecorder {
    void record(AuditEntry entry);
}
