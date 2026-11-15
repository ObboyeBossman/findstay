# S1-10: Acceptance Criteria

- **Story:** [S1-10: Email, SMS & In-App Alerts](./README.md)
- **Who this helps:** Owners, staff, and users receiving updates about their account, verification, or listings
- **Priority:** Must have | **Track:** Track A | **Days:** D5–D7
- **Summary:** Send automatic email, SMS, and in-app notifications when an account, verification case, or listing status changes.
- **Screens involved:** In-app Notification Bell & Inbox (/notifications) + formatted Email and SMS templates
- **Database tables:** notification.notification, notification_template, notification_preference, notification_delivery
- **System actions:** NotificationSender dispatcher + swappable email/SMS adapters + GET /api/v1/notifications

## What Proves This Story Is Finished

1. Account, verification, and listing updates reach users by email, SMS (if enabled), and in-app inbox.
2. Failed deliveries are logged and retried automatically; provider adapters can be swapped via settings.

## Linked Requirements

- **Functional:** [`FR-68`](../../../../requirements/functional/functional-requirements.md), [`FR-69`](../../../../requirements/functional/functional-requirements.md), [`FR-70`](../../../../requirements/functional/functional-requirements.md), [`FR-71`](../../../../requirements/functional/functional-requirements.md)
- **Non-Functional:** [`NFR-60`](../../../../requirements/non-functional/non-functional-requirements.md)
