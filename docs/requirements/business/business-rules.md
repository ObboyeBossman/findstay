# FindStay — Business Rules

1. A user must be authenticated before accessing protected account, booking, financial, messaging, review, or administrative functions.
2. Each account holds a primary profile and role memberships. Additional property-staff access must be explicitly granted by an authorised owner/manager or administrator.
3. Owners/managers may create draft listings, but only administrator-approved listings may be publicly searchable and bookable.
4. Owners/managers and property staff may access only the properties and financial records for which they have been authorised (`OrgScope`).
5. A listing must contain the minimum required property, contact, unit, price, availability, and verification information before it can be submitted for approval.
6. A booking request may be created only when the requested unit has sufficient capacity and is available for the requested date range.
7. The system shall not permit overlapping Confirmed bookings for the same unit and dates.
8. A new booking request shall begin with the status **Pending**. When the property accepts it, the status shall become **Awaiting Payment**. A booking shall become **Confirmed** only after successful payment is verified, unless an administrator has explicitly configured an approved pay-later arrangement for that property.
9. If payment is not completed within the configured payment window, the system shall cancel the booking request and release the unit's held availability.
10. A Declined, Cancelled, or expired booking shall not block the unit's availability.
11. A booking may be marked **Completed** only after the relevant stay period has ended and the property has recorded check-out, where check-out tracking applies.
12. A review may be submitted only by a guest associated with a Completed booking and only once per booking. Reported reviews may be hidden or removed by an administrator through a recorded moderation decision.
13. All payment events, refund requests, booking-status changes, and administrative financial actions must create auditable records.
14. Refund eligibility, amount, and timing shall be determined by the recorded cancellation policy, the property terms, and payment-provider procedures; a refund request must not be treated as an automatic refund.
15. Income generated from confirmed booking payments shall be recorded against the relevant property. Only authorised property users may add or amend expense records for that property.
16. Administrators may suspend users or listings that breach platform rules, fail verification, or present a safety, fraud, or data-integrity risk. Such actions must be logged.
17. The platform shall notify relevant users when a booking, payment, verification, complaint, dispute, or review status changes.
18. Personal data, payment references, and financial records shall be visible only to users whose role and relationship to the relevant booking or property authorise access.
