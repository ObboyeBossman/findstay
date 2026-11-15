# S1-03: Mobile & Desktop Page Layouts

**Details:** Priority: Must | Track B | Days 2–5  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Owner and Admin portal shells fit cleanly on small phones (360px), tablets, and desktops.
- Navigation links, icons with text labels, buttons, and status messages look and behave consistently.
- Screens work across Chrome, Edge, Firefox, and Safari with no horizontal scrolling at 360px.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-03-T1`](./tasks/S1-03-T1.md) | Design Owner & Admin shell wireframes for 360px mobile, tablet & desktop | `ui-ux` | [`S1-01-T4`](../S1-01/tasks/S1-01-T4.md) | UI/UX Design |  | Todo |
| [`S1-03-T2`](./tasks/S1-03-T2.md) | Configure Tailwind tokens & contrast-safe colour palette | `ui-ux` | [`S1-01-T2`](../S1-01/tasks/S1-01-T2.md), [`S1-01-T5`](../S1-01/tasks/S1-01-T5.md) | UI/UX Design |  | Todo |
| [`S1-03-T3`](./tasks/S1-03-T3.md) | Build Owner Portal layout shell & navigation | `frontend` | [`S1-03-T1`](./tasks/S1-03-T1.md), [`S1-03-T2`](./tasks/S1-03-T2.md) | Frontend Development |  | Todo |
| [`S1-03-T4`](./tasks/S1-03-T4.md) | Build Admin Portal layout shell & navigation | `frontend` | [`S1-03-T1`](./tasks/S1-03-T1.md), [`S1-03-T2`](./tasks/S1-03-T2.md) | Frontend Development |  | Todo |
| [`S1-03-T5`](./tasks/S1-03-T5.md) | Build shared toast, inline error, empty & loading components | `frontend` | [`S1-03-T2`](./tasks/S1-03-T2.md) | Frontend Development |  | Todo |
| [`S1-03-T6`](./tasks/S1-03-T6.md) | Test Chrome, Edge, Firefox & Safari at 360px width | `testing` | [`S1-03-T3`](./tasks/S1-03-T3.md), [`S1-03-T4`](./tasks/S1-03-T4.md), [`S1-03-T5`](./tasks/S1-03-T5.md) | QA & Testing |  | Todo |
| [`S1-03-T7`](./tasks/S1-03-T7.md) | Run accessibility lint & throttled 3G smoke test | `testing` | [`S1-03-T3`](./tasks/S1-03-T3.md), [`S1-03-T4`](./tasks/S1-03-T4.md), [`S1-03-T5`](./tasks/S1-03-T5.md) | QA & Testing |  | Todo |
