# S1-15: Acceptance Criteria

- **Story:** [S1-15: Admin Review & Listing Approval](./README.md)
- **Who this helps:** Administrators reviewing owner verifications and property listings before they go live
- **Priority:** Must have | **Track:** Track B | **Days:** D7–D8
- **Summary:** Let administrators review submitted listings and approve, reject, suspend, restore, or request corrections with a written reason.
- **Screens involved:** Admin Verification & Listing Approval Queue (/admin/approvals) and Detailed Review screen
- **Database tables:** catalog.listing_status_history, verification.review_decision
- **System actions:** Admin decision endpoints (approve/reject/request-corrections/suspend/restore) + mandatory reason + audit + alerts

## What Proves This Story Is Finished

1. Administrators can approve, reject, suspend, restore, or request corrections with a mandatory written reason.
2. Only administrator-approved listings become Published, and every decision is audited and notifies the owner.

## Linked Requirements

- **Functional:** [`UR-A02`](../../../../requirements/functional/functional-requirements.md), [`FR-21`](../../../../requirements/functional/functional-requirements.md), [`FR-88`](../../../../requirements/functional/functional-requirements.md)
