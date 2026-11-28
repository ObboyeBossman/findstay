# S1-05: Password Reset & User Profile

**Details:** Priority: Must | Track A | Days 5–6  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- A user can recover a forgotten password through a single-use, time-limited link sent to their confirmed email.
- A signed-in user can view and edit only the profile fields they are allowed to change.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-05-T1`](./tasks/S1-05-T1.md) | Design forgot-password, reset-password & My Profile screens | `ui-ux` | [`S1-04-T1`](../S1-04/tasks/S1-04-T1.md) | UI/UX Design | @Ankomah959Julius | Done |
| [`S1-05-T2`](./tasks/S1-05-T2.md) | Enforce field-level rules on GET/PATCH /api/v1/me | `backend` | [`S1-04-T5`](../S1-04/tasks/S1-04-T5.md) | Backend Development | @ObboyeBossman | Done |
| [`S1-05-T3`](./tasks/S1-05-T3.md) | Build React forgot-password & reset-password pages | `frontend` | [`S1-04-T6`](../S1-04/tasks/S1-04-T6.md), [`S1-05-T1`](./tasks/S1-05-T1.md) | Frontend Development | @ObboyeBossman | Done |
| [`S1-05-T4`](./tasks/S1-05-T4.md) | Build React My Profile page | `frontend` | [`S1-05-T1`](./tasks/S1-05-T1.md), [`S1-05-T2`](./tasks/S1-05-T2.md) | Frontend Development | @Ankomah959Julius | Done |
| [`S1-05-T5`](./tasks/S1-05-T5.md) | Test single-use reset links & cross-user profile protection | `testing` | [`S1-05-T2`](./tasks/S1-05-T2.md), [`S1-05-T3`](./tasks/S1-05-T3.md), [`S1-05-T4`](./tasks/S1-05-T4.md) | QA & Testing | @Ankomah959Julius | Done |
