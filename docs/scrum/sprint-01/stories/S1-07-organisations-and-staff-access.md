# S1-07: Organisations, memberships and staff permission grants

**Details:** Pri M, track A, D4 to D7
**Acceptance Criteria:** [See S1-07 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* An owner gets an organisation on onboarding, invites staff, grants and revokes per-property permissions, and sees only their own data.
- *Database:* organization, membership, membership_permission; `organization_id` convention on owned tables.
- *API:* Invite, accept, grant, revoke; shared `OrgScope` filter applied to all owned-data queries.
- *UI:* Staff management screen in the owner portal.
- *Tests:* Cross-organisation isolation: owner A cannot read, update or list owner B's records.
