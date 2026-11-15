# S1-15: Approval queue and publishing

**Details:** Pri M, track B, D7 to D8
**Acceptance Criteria:** [See S1-15 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* An administrator approves, rejects, suspends, restores or requests corrections; only approved listings become Published.
- *Database:* listing status history.
- *API:* Decision endpoints with mandatory reason; publish on approval.
- *UI:* Approval queue and review screen.
- *Tests:* Unapproved listing cannot be published; every decision is audited.
