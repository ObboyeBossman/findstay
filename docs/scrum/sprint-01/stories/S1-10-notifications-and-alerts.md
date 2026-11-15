# S1-10: Email, SMS, in-app and the event registry

**Details:** Pri M, track A, D5 to D7
**Acceptance Criteria:** [See S1-10 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* Account and verification-status events reach users by email, SMS (if provider chosen) and in-app. Supabase Auth owns authentication email delivery.
- *Database:* notification, notification_template, notification_preference.
- *API:* Dispatcher with channel adapters (email, SMS) behind interfaces; templates by event type.
- *Tests:* Delivery failure is logged and retried; provider adapter can be swapped without touching callers.
