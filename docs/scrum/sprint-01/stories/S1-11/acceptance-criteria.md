# S1-11: Acceptance Criteria

- **Story:** [S1-11: Privacy Notice & User Consent](./README.md)
- **Who this helps:** All users (protecting personal data under Ghana's Data Protection Act, 2012 — Act 843)
- **Priority:** Should have | **Track:** Track A | **Days:** D6–D7
- **Summary:** Show a clear Ghana Act 843 privacy notice at sign-up, record user consent, and ask only for needed personal information.
- **Screens involved:** Privacy Notice modal/page (/privacy) and mandatory Act 843 consent checkbox on Sign Up
- **Database tables:** identity.consent_record (user_id, policy_version, consented_at, ip_address)
- **System actions:** POST /api/v1/me/consents + strict response filtering so personal data stays private

## What Proves This Story Is Finished

1. Consent under Ghana Act 843 is captured and recorded with timestamp and policy version at registration.
2. Forms collect only necessary fields, and personal data is visible only to authorised users.

## Linked Requirements

- **Non-Functional:** [`NFR-31`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-32`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-35`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-36`](../../../../requirements/non-functional/non-functional-requirements.md)
