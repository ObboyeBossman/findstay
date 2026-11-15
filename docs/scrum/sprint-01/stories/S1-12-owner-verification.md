# S1-12: Owner onboarding and verification

**Details:** Pri M, track B, D6 to D8
**Acceptance Criteria:** [See S1-12 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* An owner submits identity and property documents, tracks status, and sensitive identity data is encrypted at rest.
- *Database:* verification_case, verification_document, review_decision; encrypted columns for identity numbers (Ghana Card).
- *API:* Submit, resubmit after correction, status query.
- *UI:* Onboarding wizard and status tracker.
- *Tests:* Encrypted at rest verified in the database; documents unreadable to non-reviewers; licence document list per P-12.
