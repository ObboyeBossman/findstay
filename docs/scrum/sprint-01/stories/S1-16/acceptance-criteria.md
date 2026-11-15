# S1-16: Acceptance Criteria

- **Story:** [S1-16: Admin Dashboard, Users & Settings](./README.md)
- **Who this helps:** Administrators monitoring platform activity, managing user accounts, and toggling settings
- **Priority:** Should have | **Track:** Track B | **Days:** D6–D8
- **Summary:** Give administrators a summary dashboard, tools to create, suspend, or restore user accounts, and a page to update platform settings.
- **Screens involved:** Admin Dashboard (/admin), User Management (/admin/users), Platform Settings (/admin/settings)
- **Database tables:** admin.platform_setting (key-value settings and feature flags)
- **System actions:** GET /api/v1/admin/dashboard, user create/suspend/restore APIs, GET/PUT /api/v1/admin/settings

## What Proves This Story Is Finished

1. Administrators see summary counts on the dashboard and can create, suspend, or restore user accounts.
2. Suspended users are blocked immediately from signing in, and all user and setting changes are audited.

## Linked Requirements

- **Functional:** [`UR-A01`](../../../../requirements/functional/functional-requirements.md), [`FR-87`](../../../../requirements/functional/functional-requirements.md), [`UR-A08`](../../../../requirements/functional/functional-requirements.md), [`FR-92`](../../../../requirements/functional/functional-requirements.md), [`FR-86`](../../../../requirements/functional/functional-requirements.md)
