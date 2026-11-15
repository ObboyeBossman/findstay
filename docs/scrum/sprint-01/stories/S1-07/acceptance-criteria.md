# S1-07: Acceptance Criteria

- **Story:** [S1-07: Owner Companies & Staff Access](./README.md)
- **Who this helps:** Property owners managing a business and inviting staff for specific properties
- **Priority:** Must have | **Track:** Track A | **Days:** D4–D7
- **Summary:** Give each property owner their own company space, let them invite staff for specific properties, and keep every owner's data separate.
- **Screens involved:** Company & Staff Management (/owner/staff), Staff Invite Acceptance (/owner/invitations)
- **Database tables:** organization.organization, organization.membership, organization.membership_permission
- **System actions:** POST /api/v1/owner/staff/invite, accept, grant/revoke permissions + shared OrgScope filter

## What Proves This Story Is Finished

1. An owner automatically gets an organisation on onboarding.
2. An owner can invite staff and grant or revoke per-property permissions.
3. Owner A can never view, list, or edit Owner B's records.

## Linked Requirements

- **Business:** [`BRL-04`](../../../../requirements/business/business-requirements.md), [`BRL-05`](../../../../requirements/business/business-requirements.md)
- **Functional:** [`UR-O15`](../../../../requirements/functional/functional-requirements.md), [`UR-PS01`](../../../../requirements/functional/functional-requirements.md), [`UR-PSN01`](../../../../requirements/functional/functional-requirements.md), [`UR-PM03`](../../../../requirements/functional/functional-requirements.md), [`FR-09`](../../../../requirements/functional/functional-requirements.md), [`UR-ON02`](../../../../requirements/functional/functional-requirements.md)
