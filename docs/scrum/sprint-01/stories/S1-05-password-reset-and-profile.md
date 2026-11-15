# S1-05: Password recovery and profile

**Details:** Pri M, track A, D5 to D6
**Acceptance Criteria:** [See S1-05 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* A user recovers a password through a verified channel and edits profile fields they are authorised to edit.
- *API:* `GET/PATCH /me` only. Supabase Auth handles request-reset and confirm-reset directly from the React UI.
- *UI:* Forgot-password flow; profile page.
- *Tests:* Reset link single-use and time-limited; cannot edit another user's profile.
