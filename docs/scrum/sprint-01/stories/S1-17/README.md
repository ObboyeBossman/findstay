# S1-17: Final Testing & Release R1

**Details:** Priority: Must | Track A | Days 9–10  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Two pilot owners complete the full sign-up-to-published-listing journey on staging.
- Cross-owner isolation and pre-release backup are verified, and Release R1 is tagged and live on production.
- Sprint Review is accepted and Sprint Retrospective actions are recorded.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-17-T1`](./tasks/S1-17-T1.md) | Run cumulative R1 automated regression suite | `testing` | [`S1-01-T12`](../S1-01/tasks/S1-01-T12.md), [`S1-12-T6`](../S1-12/tasks/S1-12-T6.md), [`S1-13-T6`](../S1-13/tasks/S1-13-T6.md), [`S1-14-T5`](../S1-14/tasks/S1-14-T5.md), [`S1-15-T5`](../S1-15/tasks/S1-15-T5.md), [`S1-16-T6`](../S1-16/tasks/S1-16-T6.md) | QA & Testing |  | Todo |
| [`S1-17-T2`](./tasks/S1-17-T2.md) | Run 7-step UAT walkthrough with two pilot property owners | `testing` | [`S1-17-T1`](./tasks/S1-17-T1.md) | QA & Testing |  | Todo |
| [`S1-17-T3`](./tasks/S1-17-T3.md) | Verify cross-owner isolation & V1_01-V1_19 migrations | `testing` | [`S1-07-T7`](../S1-07/tasks/S1-07-T7.md), [`S1-13-T3`](../S1-13/tasks/S1-13-T3.md) | QA & Testing |  | Todo |
| [`S1-17-T4`](./tasks/S1-17-T4.md) | Take pre-release database backup & verify recovery readiness | `database` | [`S1-02-T7`](../S1-02/tasks/S1-02-T7.md), [`S1-17-T1`](./tasks/S1-17-T1.md) | Database & Data |  | Todo |
| [`S1-17-T5`](./tasks/S1-17-T5.md) | Tag Release R1, deploy to production & run smoke tests | `devops` | [`S1-17-T1`](./tasks/S1-17-T1.md), [`S1-17-T2`](./tasks/S1-17-T2.md), [`S1-17-T3`](./tasks/S1-17-T3.md), [`S1-17-T4`](./tasks/S1-17-T4.md) | Architecture, Cloud & Security |  | Todo |
| [`S1-17-T6`](./tasks/S1-17-T6.md) | Run Sprint Review demo & record Retrospective actions | `lead-scrum` | [`S1-17-T5`](./tasks/S1-17-T5.md) | Team Lead & Scrum Master |  | Todo |
