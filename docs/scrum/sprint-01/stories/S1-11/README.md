# S1-11: Privacy Notice & User Consent

**Details:** Priority: Should | Track A | Days 6–7  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Consent under Ghana Act 843 is captured and recorded with timestamp and policy version at registration.
- Forms collect only necessary fields, and personal data is visible only to authorised users.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-11-T1`](./tasks/S1-11-T1.md) | Draft plain-English Ghana Act 843 privacy notice & consent wording | `requirements` | [`S1-01-T1`](../S1-01/tasks/S1-01-T1.md) | Product & Requirements |  | Todo |
| [`S1-11-T2`](./tasks/S1-11-T2.md) | Create identity.consent_record table | `database` | [`S1-04-T2`](../S1-04/tasks/S1-04-T2.md) | Database & Data |  | Todo |
| [`S1-11-T3`](./tasks/S1-11-T3.md) | Build consent recording API & enforce DTO personal-data filtering | `backend` | [`S1-11-T2`](./tasks/S1-11-T2.md), [`S1-04-T5`](../S1-04/tasks/S1-04-T5.md) | Backend Development |  | Todo |
| [`S1-11-T4`](./tasks/S1-11-T4.md) | Add mandatory consent checkbox & Privacy Notice view in React | `frontend` | [`S1-04-T6`](../S1-04/tasks/S1-04-T6.md), [`S1-11-T1`](./tasks/S1-11-T1.md), [`S1-11-T3`](./tasks/S1-11-T3.md) | Frontend Development |  | Todo |
| [`S1-11-T5`](./tasks/S1-11-T5.md) | Run data-minimisation review & authorised-only access tests | `testing` | [`S1-11-T3`](./tasks/S1-11-T3.md), [`S1-11-T4`](./tasks/S1-11-T4.md) | QA & Testing |  | Todo |
