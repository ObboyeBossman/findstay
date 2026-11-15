# S1-15: Admin Review & Listing Approval

**Details:** Priority: Must | Track B | Days 7–8  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Administrators can approve, reject, suspend, restore, or request corrections with a mandatory written reason.
- Only administrator-approved listings become Published, and every decision is audited and notifies the owner.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-15-T1`](./tasks/S1-15-T1.md) | Design Admin Approval Queue & Detailed Review screen | `ui-ux` | [`S1-03-T4`](../S1-03/tasks/S1-03-T4.md) | UI/UX Design |  | Todo |
| [`S1-15-T2`](./tasks/S1-15-T2.md) | Create listing_status_history table | `database` | [`S1-13-T2`](../S1-13/tasks/S1-13-T2.md), [`S1-12-T2`](../S1-12/tasks/S1-12-T2.md) | Database & Data |  | Todo |
| [`S1-15-T3`](./tasks/S1-15-T3.md) | Build admin approval/decision APIs with publish & notification hooks | `backend` | [`S1-15-T2`](./tasks/S1-15-T2.md), [`S1-08-T3`](../S1-08/tasks/S1-08-T3.md), [`S1-10-T3`](../S1-10/tasks/S1-10-T3.md), [`S1-09-T4`](../S1-09/tasks/S1-09-T4.md) | Backend Development |  | Todo |
| [`S1-15-T4`](./tasks/S1-15-T4.md) | Build React Admin Approval Queue & Review screen | `frontend` | [`S1-15-T1`](./tasks/S1-15-T1.md), [`S1-15-T3`](./tasks/S1-15-T3.md), [`S1-09-T5`](../S1-09/tasks/S1-09-T5.md) | Frontend Development |  | Todo |
| [`S1-15-T5`](./tasks/S1-15-T5.md) | Test unapproved-publish block, audit logging & owner alerts | `testing` | [`S1-15-T3`](./tasks/S1-15-T3.md), [`S1-15-T4`](./tasks/S1-15-T4.md) | QA & Testing |  | Todo |
