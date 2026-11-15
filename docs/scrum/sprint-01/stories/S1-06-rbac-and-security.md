# S1-06: Data-driven RBAC and security baseline

**Details:** Pri M, track A, D4 to D6
**Acceptance Criteria:** [See S1-06 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* Every endpoint is permission-guarded from tables; an administrator-only route is unreachable to others.
- *Database:* role, permission, role_permission; membership-based role model if P-04 is confirmed (BRL-02 reworded).
- *API:* `@RequiresPermission` guard; HTTPS/TLS only; input validation, output encoding, parameterised queries; object-level access checks.
- *Tests:* Role-by-endpoint matrix; direct-object-reference probes; SQL injection and XSS probes.
