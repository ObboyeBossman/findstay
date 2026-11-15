# S1-16: Admin Dashboard, Users & Settings

**Details:** Priority: Should | Track B | Days 6–8  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Administrators see summary counts on the dashboard and can create, suspend, or restore user accounts.
- Suspended users are blocked immediately from signing in, and all user and setting changes are audited.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-16-T1`](./tasks/S1-16-T1.md) | Design Admin Dashboard, User Management & Settings pages | `ui-ux` | [`S1-03-T4`](../S1-03/tasks/S1-03-T4.md) | UI/UX Design |  | Todo |
| [`S1-16-T2`](./tasks/S1-16-T2.md) | Build Admin Dashboard summary endpoint | `backend` | [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md), [`S1-12-T4`](../S1-12/tasks/S1-12-T4.md), [`S1-13-T4`](../S1-13/tasks/S1-13-T4.md) | Backend Development |  | Todo |
| [`S1-16-T3`](./tasks/S1-16-T3.md) | Build User Management endpoints (search, create, suspend, restore) | `backend` | [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md), [`S1-08-T3`](../S1-08/tasks/S1-08-T3.md) | Backend Development |  | Todo |
| [`S1-16-T4`](./tasks/S1-16-T4.md) | Build Platform Settings endpoints with old/new value audit logging | `backend` | [`S1-01-T15`](../S1-01/tasks/S1-01-T15.md), [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md), [`S1-08-T3`](../S1-08/tasks/S1-08-T3.md) | Backend Development |  | Todo |
| [`S1-16-T5`](./tasks/S1-16-T5.md) | Build React Admin Dashboard, Users & Settings screens | `frontend` | [`S1-16-T1`](./tasks/S1-16-T1.md), [`S1-16-T2`](./tasks/S1-16-T2.md), [`S1-16-T3`](./tasks/S1-16-T3.md), [`S1-16-T4`](./tasks/S1-16-T4.md) | Frontend Development |  | Todo |
| [`S1-16-T6`](./tasks/S1-16-T6.md) | Test suspended-user block & settings audit trail | `testing` | [`S1-16-T2`](./tasks/S1-16-T2.md), [`S1-16-T3`](./tasks/S1-16-T3.md), [`S1-16-T4`](./tasks/S1-16-T4.md), [`S1-16-T5`](./tasks/S1-16-T5.md) | QA & Testing |  | Todo |
