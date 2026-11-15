# S1-08: Append-only audit trail

**Details:** Pri S, track A, D5 to D7
**Acceptance Criteria:** [See S1-08 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* Admin and verification actions are recorded with action, user, date/time and entity; records cannot be edited or deleted.
- *Database:* audit_log with `entity_type` and `entity_id`; application role has INSERT and SELECT only.
- *API:* `AuditRecorder` API for all modules; admin audit viewer with filters.
- *Tests:* Update and delete attempts fail at database level; suspension and restoration appear in the log.
