# S1-10: Email, SMS & In-App Alerts

**Details:** Priority: Must | Track A | Days 5–7  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Account, verification, and listing updates reach users by email, SMS (if enabled), and in-app inbox.
- Failed deliveries are logged and retried automatically; provider adapters can be swapped via settings.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-10-T1`](./tasks/S1-10-T1.md) | Design Notification Bell badge & Inbox screen | `ui-ux` | [`S1-03-T3`](../S1-03/tasks/S1-03-T3.md), [`S1-03-T4`](../S1-03/tasks/S1-03-T4.md) | UI/UX Design | ObboyeBossman | Done |
| [`S1-10-T2`](./tasks/S1-10-T2.md) | Create notification, template, preference & delivery tables | `database` | [`S1-04-T2`](../S1-04/tasks/S1-04-T2.md) | Database & Data | ObboyeBossman | Done |
| [`S1-10-T3`](./tasks/S1-10-T3.md) | Build NotificationSender dispatcher & swappable email/SMS adapters | `backend` | [`S1-10-T2`](./tasks/S1-10-T2.md), [`S1-02-T4`](../S1-02/tasks/S1-02-T4.md) | Backend Development | ObboyeBossman | Done |
| [`S1-10-T4`](./tasks/S1-10-T4.md) | Create templates for verification, listing & staff invite events | `backend` | [`S1-10-T2`](./tasks/S1-10-T2.md), [`S1-10-T3`](./tasks/S1-10-T3.md) | Backend Development | ObboyeBossman | Done |
| [`S1-10-T5`](./tasks/S1-10-T5.md) | Build GET /api/v1/notifications & mark-as-read endpoints | `backend` | [`S1-10-T3`](./tasks/S1-10-T3.md), [`S1-04-T4`](../S1-04/tasks/S1-04-T4.md) | Backend Development | ObboyeBossman | Done |
| [`S1-10-T6`](./tasks/S1-10-T6.md) | Build React Notification Bell & Inbox UI | `frontend` | [`S1-10-T1`](./tasks/S1-10-T1.md), [`S1-10-T5`](./tasks/S1-10-T5.md) | Frontend Development | ObboyeBossman | Done |
| [`S1-10-T7`](./tasks/S1-10-T7.md) | Test retry logging, adapter swapping & SMS fallback | `testing` | [`S1-10-T3`](./tasks/S1-10-T3.md), [`S1-10-T4`](./tasks/S1-10-T4.md), [`S1-10-T5`](./tasks/S1-10-T5.md), [`S1-10-T6`](./tasks/S1-10-T6.md) | QA & Testing | ObboyeBossman | Done |
