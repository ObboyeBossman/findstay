# S1-05: Acceptance Criteria

- **Story:** [S1-05: Password Reset & User Profile](./README.md)
- **Who this helps:** Any signed-in user updating their details or recovering a forgotten password
- **Priority:** Must have | **Track:** Track A | **Days:** D5–D6
- **Summary:** Let users reset a forgotten password through their confirmed email and update their own profile details.
- **Screens involved:** Forgot Password (/auth/forgot-password), Reset Password (/auth/reset-password), My Profile (/profile)
- **Database tables:** identity.user_profile (name, phone, avatar_url, preferred_language)
- **System actions:** Supabase password reset flow + GET /api/v1/me and PATCH /api/v1/me

## What Proves This Story Is Finished

1. A user can recover a forgotten password through a single-use, time-limited link sent to their confirmed email.
2. A signed-in user can view and edit only the profile fields they are allowed to change.

## Linked Requirements

- **Functional:** [`FR-04`](../../../../requirements/functional/functional-requirements.md), [`FR-06`](../../../../requirements/functional/functional-requirements.md)
