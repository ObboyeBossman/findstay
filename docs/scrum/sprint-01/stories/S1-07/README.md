# S1-07: Owner Companies & Staff Access

**Details:** Priority: Must | Track A | Days 4–7  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- An owner automatically gets an organisation on onboarding.
- An owner can invite staff and grant or revoke per-property permissions.
- Owner A can never view, list, or edit Owner B's records.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-07-T1`](./tasks/S1-07-T1.md) | Design Staff Management & Invite Acceptance screens | `ui-ux` | [`S1-03-T3`](../S1-03/tasks/S1-03-T3.md) | UI/UX Design | @dztrb | Done |
| [`S1-07-T2`](./tasks/S1-07-T2.md) | Create organization, membership & membership_permission tables | `database` | [`S1-04-T2`](../S1-04/tasks/S1-04-T2.md) | Database & Data |  | Done (V1_05) |
| [`S1-07-T3`](./tasks/S1-07-T3.md) | Auto-create owner organisation on onboarding | `backend` | [`S1-07-T2`](./tasks/S1-07-T2.md), [`S1-04-T5`](../S1-04/tasks/S1-04-T5.md) | Backend Development | @dztrb | Done |
| [`S1-07-T4`](./tasks/S1-07-T4.md) | Build staff invite, accept, grant & revoke permission APIs | `backend` | [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md), [`S1-07-T2`](./tasks/S1-07-T2.md) | Backend Development | @ObboyeBossman | Done |
| [`S1-07-T5`](./tasks/S1-07-T5.md) | Apply shared OrgScope isolation filter across owned queries | `backend` | [`S1-07-T2`](./tasks/S1-07-T2.md) | Backend Development | @dztrb | Done |
| [`S1-07-T6`](./tasks/S1-07-T6.md) | Build React Staff Management & Invite Acceptance pages | `frontend` | [`S1-07-T1`](./tasks/S1-07-T1.md), [`S1-07-T3`](./tasks/S1-07-T3.md), [`S1-07-T4`](./tasks/S1-07-T4.md) | Frontend Development |  | Todo |
| [`S1-07-T7`](./tasks/S1-07-T7.md) | Test cross-organisation isolation (Owner A vs Owner B) | `testing` | [`S1-07-T4`](./tasks/S1-07-T4.md), [`S1-07-T5`](./tasks/S1-07-T5.md), [`S1-07-T6`](./tasks/S1-07-T6.md) | QA & Testing |  | Todo |
