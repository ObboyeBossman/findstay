# S1-12: Owner ID & Property Verification

**Details:** Priority: Must | Track B | Days 6–8  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- An owner can submit their Ghana Card, property ownership proof, and GTA licence, and track status.
- If corrections are requested, the owner can upload updated documents and resubmit.
- Ghana Card numbers are AES-256 encrypted at rest in the database and documents are hidden from non-reviewers.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-12-T1`](./tasks/S1-12-T1.md) | Design Owner Verification Wizard & Status Tracker screens | `ui-ux` | [`S1-03-T3`](../S1-03/tasks/S1-03-T3.md) | UI/UX Design |  | Todo |
| [`S1-12-T2`](./tasks/S1-12-T2.md) | Create verification_case, verification_document & review_decision tables | `database` | [`S1-07-T2`](../S1-07/tasks/S1-07-T2.md), [`S1-09-T3`](../S1-09/tasks/S1-09-T3.md) | Database & Data |  | Todo |
| [`S1-12-T3`](./tasks/S1-12-T3.md) | Implement AES-256 encryption & masking for Ghana Card numbers | `backend` | [`S1-12-T2`](./tasks/S1-12-T2.md), [`S1-02-T4`](../S1-02/tasks/S1-02-T4.md) | Backend Development |  | Todo |
| [`S1-12-T4`](./tasks/S1-12-T4.md) | Build verification submit, resubmit & status APIs | `backend` | [`S1-12-T2`](./tasks/S1-12-T2.md), [`S1-12-T3`](./tasks/S1-12-T3.md), [`S1-07-T5`](../S1-07/tasks/S1-07-T5.md), [`S1-09-T5`](../S1-09/tasks/S1-09-T5.md) | Backend Development |  | Todo |
| [`S1-12-T5`](./tasks/S1-12-T5.md) | Build React Verification Wizard & Status Tracker | `frontend` | [`S1-12-T1`](./tasks/S1-12-T1.md), [`S1-12-T4`](./tasks/S1-12-T4.md), [`S1-09-T6`](../S1-09/tasks/S1-09-T6.md) | Frontend Development |  | Todo |
| [`S1-12-T6`](./tasks/S1-12-T6.md) | Test encryption at rest, masking & reviewer-only document access | `testing` | [`S1-12-T3`](./tasks/S1-12-T3.md), [`S1-12-T4`](./tasks/S1-12-T4.md), [`S1-12-T5`](./tasks/S1-12-T5.md) | QA & Testing |  | Todo |
