# S1-14: Acceptance Criteria

- **Story:** [S1-14: Room Availability Calendar](./README.md)
- **Who this helps:** Owners and property staff managing when each room or unit is available
- **Priority:** Must have | **Track:** Track B | **Days:** D7–D8
- **Summary:** Let owners and authorised staff block or unblock dates on each room's calendar, while preventing overlapping blocks.
- **Screens involved:** Unit Availability Calendar (/owner/listings/:id/calendar) with date-range block/unblock controls
- **Database tables:** availability.availability_block (with PostgreSQL btree_gist overlap exclusion constraint per unit_id)
- **System actions:** GET /api/v1/owner/units/:unitId/calendar, POST blocks, DELETE blocks

## What Proves This Story Is Finished

1. Owners and authorised staff can view a unit's calendar and block or unblock date ranges.
2. The database rejects overlapping active blocks on the same unit—even under concurrent requests.

## Linked Requirements

- **Functional:** [`UR-O02`](../../../../requirements/functional/functional-requirements.md), [`UR-O03`](../../../../requirements/functional/functional-requirements.md), [`FR-18`](../../../../requirements/functional/functional-requirements.md), [`FR-39`](../../../../requirements/functional/functional-requirements.md)
