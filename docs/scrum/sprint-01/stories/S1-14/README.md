# S1-14: Room Availability Calendar

**Details:** Priority: Must | Track B | Days 7–8  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Owners and authorised staff can view a unit's calendar and block or unblock date ranges.
- The database rejects overlapping active blocks on the same unit—even under concurrent requests.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-14-T1`](./tasks/S1-14-T1.md) | Design Unit Availability Calendar & block/unblock controls | `ui-ux` | [`S1-03-T3`](../S1-03/tasks/S1-03-T3.md) | UI/UX Design |  | Todo |
| [`S1-14-T2`](./tasks/S1-14-T2.md) | Create availability_block table with btree_gist exclusion constraint | `database` | [`S1-13-T2`](../S1-13/tasks/S1-13-T2.md) | Database & Data |  | Todo |
| [`S1-14-T3`](./tasks/S1-14-T3.md) | Build calendar read, create block & remove block APIs | `backend` | [`S1-14-T2`](./tasks/S1-14-T2.md), [`S1-07-T5`](../S1-07/tasks/S1-07-T5.md) | Backend Development |  | Todo |
| [`S1-14-T4`](./tasks/S1-14-T4.md) | Build React Unit Availability Calendar view | `frontend` | [`S1-14-T1`](./tasks/S1-14-T1.md), [`S1-14-T3`](./tasks/S1-14-T3.md) | Frontend Development |  | Todo |
| [`S1-14-T5`](./tasks/S1-14-T5.md) | Test concurrent overlapping block requests | `testing` | [`S1-14-T2`](./tasks/S1-14-T2.md), [`S1-14-T3`](./tasks/S1-14-T3.md), [`S1-14-T4`](./tasks/S1-14-T4.md) | QA & Testing |  | Todo |
