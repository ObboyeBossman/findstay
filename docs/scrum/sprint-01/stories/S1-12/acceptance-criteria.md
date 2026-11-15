# S1-12: Acceptance Criteria

- **Story:** [S1-12: Owner ID & Property Verification](./README.md)
- **Who this helps:** Property owners proving their identity and property ownership before listing
- **Priority:** Must have | **Track:** Track B | **Days:** D6–D8
- **Summary:** Let owners submit their Ghana Card, ownership proof, and tourism licence for review, with ID numbers encrypted in the database.
- **Screens involved:** Owner Verification Wizard (/owner/verification) and Verification Status Tracker
- **Database tables:** verification.verification_case (AES-256 encrypted Ghana Card), verification_document, review_decision
- **System actions:** Submit, resubmit after corrections, status query API + masked Ghana Card display

## What Proves This Story Is Finished

1. An owner can submit their Ghana Card, property ownership proof, and GTA licence, and track status.
2. If corrections are requested, the owner can upload updated documents and resubmit.
3. Ghana Card numbers are AES-256 encrypted at rest in the database and documents are hidden from non-reviewers.

## Linked Requirements

- **Functional:** [`UR-O01`](../../../../requirements/functional/functional-requirements.md), [`FR-08`](../../../../requirements/functional/functional-requirements.md)
- **Non-Functional:** [`NFR-28`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-34`](../../../../requirements/non-functional/non-functional-requirements.md)
- **Technical:** [`TA-09`](../../../../requirements/technical/technical-requirements.md)
