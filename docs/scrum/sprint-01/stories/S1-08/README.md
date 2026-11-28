# S1-08: Permanent Activity Log

**Details:** Priority: Should | Track A | Days 5–7  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Admin, verification, suspension, and restoration actions are recorded with actor, action, entity, and date/time.
- Audit records cannot be edited or deleted—even at the database role level.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-08-T1`](./tasks/S1-08-T1.md) | Design Admin Activity Log viewer & filter controls | `ui-ux` | [`S1-03-T4`](../S1-03/tasks/S1-03-T4.md) | UI/UX Design | ObboyeBossman | Done |
| [`S1-08-T2`](./tasks/S1-08-T2.md) | Create append-only audit.audit_log table & restrict DB role | `database` | [`S1-01-T9`](../S1-01/tasks/S1-01-T9.md) | Database & Data | ObboyeBossman | Done |
| [`S1-08-T3`](./tasks/S1-08-T3.md) | Build shared AuditRecorder API for all backend modules | `backend` | [`S1-08-T2`](./tasks/S1-08-T2.md) | Backend Development | ObboyeBossman | Done |
| [`S1-08-T4`](./tasks/S1-08-T4.md) | Build GET /api/v1/admin/audit-logs endpoint with filters | `backend` | [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md), [`S1-08-T2`](./tasks/S1-08-T2.md) | Backend Development | ObboyeBossman | Done |
| [`S1-08-T5`](./tasks/S1-08-T5.md) | Build React Admin Activity Log page | `frontend` | [`S1-08-T1`](./tasks/S1-08-T1.md), [`S1-08-T4`](./tasks/S1-08-T4.md) | Frontend Development | ObboyeBossman | Done |
| [`S1-08-T6`](./tasks/S1-08-T6.md) | Test DB immutability & verify suspension/restoration logs | `testing` | [`S1-08-T3`](./tasks/S1-08-T3.md), [`S1-08-T4`](./tasks/S1-08-T4.md), [`S1-08-T5`](./tasks/S1-08-T5.md) | QA & Testing | ObboyeBossman | Done |
