# S1-06: Acceptance Criteria

- **Story:** [S1-06: Role Permissions & Safe Access](./README.md)
- **Who this helps:** All users (protecting private owner records and admin-only controls)
- **Priority:** Must have | **Track:** Track A | **Days:** D4–D6
- **Summary:** Make sure every screen and server action checks the signed-in person's role and permissions so admin and owner tools stay protected.
- **Screens involved:** Access-denied states and role-aware menus in Owner and Admin portals
- **Database tables:** identity.role, identity.permission, identity.role_permission
- **System actions:** @RequiresPermission guard on API routes + input validation + object-level ownership checks + HTTPS

## What Proves This Story Is Finished

1. Every protected endpoint checks permissions from the database; non-admins cannot reach admin routes.
2. All inputs are validated and queries are parameterised to block SQL injection, XSS, and unauthorised direct record access.

## Linked Requirements

- **Business:** [`BRL-02`](../../../../requirements/business/business-requirements.md)
- **Functional:** [`FR-07`](../../../../requirements/functional/functional-requirements.md), [`UR-AN01`](../../../../requirements/functional/functional-requirements.md)
- **Non-Functional:** [`NFR-20`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-21`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-23`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-24`](../../../../requirements/non-functional/non-functional-requirements.md)
