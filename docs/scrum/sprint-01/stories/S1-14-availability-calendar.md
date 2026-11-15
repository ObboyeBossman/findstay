# S1-14: Availability calendar and owner blocks

**Details:** Pri M, track B, D7 to D8
**Acceptance Criteria:** [See S1-14 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* An owner manages the calendar per unit; overlapping active blocks are rejected by the database.
- *Database:* availability_block with reason lookup and exclusion constraint.
- *API:* Create, remove and list blocks; calendar read API.
- *UI:* Calendar view in the owner portal.
- *Tests:* Concurrent block attempts: exactly one succeeds.
