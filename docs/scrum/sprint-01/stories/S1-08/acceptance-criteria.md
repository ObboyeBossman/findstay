# S1-08: Acceptance Criteria

- **Story:** [S1-08: Permanent Activity Log](./README.md)
- **Who this helps:** Administrators auditing platform activity and investigating disputes or changes
- **Priority:** Should have | **Track:** Track A | **Days:** D5–D7
- **Summary:** Record a permanent history of important admin, verification, and account actions that no one can edit or delete.
- **Screens involved:** Admin Activity Log viewer (/admin/audit) with user, action, entity, and date filters
- **Database tables:** audit.audit_log (append-only; application DB role has INSERT and SELECT only)
- **System actions:** Shared AuditRecorder module API + GET /api/v1/admin/audit-logs

## What Proves This Story Is Finished

1. Admin, verification, suspension, and restoration actions are recorded with actor, action, entity, and date/time.
2. Audit records cannot be edited or deleted—even at the database role level.

## Linked Requirements

- **Business:** [`BR-11`](../../../../requirements/business/business-requirements.md), [`BRL-19`](../../../../requirements/business/business-requirements.md)
- **Functional:** [`UR-A07`](../../../../requirements/functional/functional-requirements.md), [`UR-AN02`](../../../../requirements/functional/functional-requirements.md)
- **Non-Functional:** [`NFR-66`](../../../../requirements/non-functional/non-functional-requirements.md)
