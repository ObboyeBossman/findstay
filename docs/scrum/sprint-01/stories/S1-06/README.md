# S1-06: Role Permissions & Safe Access

**Details:** Priority: Must | Track A | Days 4–6  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- Every protected endpoint checks permissions from the database; non-admins cannot reach admin routes.
- All inputs are validated and queries are parameterised to block SQL injection, XSS, and unauthorised direct record access.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-06-T1`](./tasks/S1-06-T1.md) | Create role, permission & role_permission tables & seed mappings | `database` | [`S1-04-T2`](../S1-04/tasks/S1-04-T2.md) | Database & Data | @joseibonsu206-gif | Done |
| [`S1-06-T2`](./tasks/S1-06-T2.md) | Implement @RequiresPermission guard & object-level access checks | `backend` | [`S1-04-T4`](../S1-04/tasks/S1-04-T4.md), [`S1-06-T1`](./S1-06-T1.md) | Backend Development | @joseibonsu206-gif | Done |
| [`S1-06-T3`](./tasks/S1-06-T3.md) | Enforce input validation, XSS encoding & HTTPS-only rules | `backend` | [`S1-01-T7`](../S1-01/tasks/S1-01-T7.md), [`S1-02-T3`](../S1-02/tasks/S1-02-T3.md) | Backend Development | @joseibonsu206-gif | Done |
| [`S1-06-T4`](./tasks/S1-06-T4.md) | Add role-aware menus & Access Denied states in React | `frontend` | [`S1-03-T3`](../S1-03/tasks/S1-03-T3.md), [`S1-03-T4`](../S1-03/tasks/S1-03-T4.md), [`S1-06-T2`](./S1-06-T2.md) | Frontend Development | @ObboyeBossman | Done |
| [`S1-06-T5`](./tasks/S1-06-T5.md) | Test role-by-endpoint matrix, IDOR, SQLi & XSS probes | `testing` | [`S1-06-T2`](./S1-06-T2.md), [`S1-06-T3`](./S1-06-T3.md), [`S1-06-T4`](./S1-06-T4.md) | QA & Testing |  | Todo |
