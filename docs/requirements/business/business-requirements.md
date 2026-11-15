# FindStay — Business Requirements & Rules (`BR-*`, `BRL-*`)

> **Traceability:** Allocated across Sprints 1–5 in [`docs/scrum/scrum.md`](../../scrum/scrum.md).
> **Total Items:** 32

| ID | Requirement | Module | Phase | Sprint | Story |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `BR-01` | FindStay shall provide a central platform for discovering accommodation in Ghana. | `platform` | P1 | S2 | S2-01 |
| `BR-02` | The platform shall initially focus on Takoradi as its proposed local pilot context. | `platform` | P1 | S1 | S1-13 |
| `BR-03` | The platform shall support hotels, budget hotels, guesthouses, student hostels and serviced/short-stay apartments. | `catalog` | P1+P2 | S1 | S1-13 |
| `BR-04` | The platform shall improve online visibility of accommodation providers. | `search` | P1 | S2 | S2-01 |
| `BR-05` | The platform shall reduce fragmentation of accommodation information across informal channels. | `platform` | P1 | S2 | S2-03 |
| `BR-06` | The platform shall reduce booking conflicts and double-bookings. | `availability` | P1 | S2 | S2-08 |
| `BR-07` | The platform shall support local Ghanaian payment methods and operate in Ghanaian Cedis (GHS). | `payments` | P1+P2 | S2 | S2-10 |
| `BR-08` | The platform shall provide property owners with tools for managing bookings, income and expenses. | `finance` | P1 | S3 | S3-04 |
| `BR-09` | The platform shall provide administrators with tools for platform oversight, verification and dispute resolution. | `admin` | P1+P2 | S3 | S3-07 |
| `BR-10` | The platform shall provide an accessible solution suitable for small and medium-sized accommodation providers. | `platform` | P1+P2 | S1 | S1-03 |
| `BR-11` | The platform shall support accountability through verification, audit records and administrative controls. | `audit` | P1+P2 | S1 | S1-08 |
| `BR-12` | The platform shall support a sustainable revenue model including host booking commission, guest convenience fee, sponsored listings, premium subscription tier and optional verification/photography packages. | `payments` | P1+P2 | S2 | S2-10 |
| `BRL-01` | Users must authenticate before accessing protected account, booking, financial, messaging, review or administrative functions. | `identity` | P1+P2 | S1 | S1-04 |
| `BRL-02` | Each account shall have one primary role. | `identity` | P1 | S1 | S1-06 |
| `BRL-03` | Only administrator-approved listings are publicly searchable and bookable. | `verification` | P1 | S2 | S2-03 |
| `BRL-04` | Additional property-staff access must be explicitly granted by an authorised owner/manager or administrator. | `organization` | P1 | S1 | S1-07 |
| `BRL-05` | Owners/managers and staff may access only properties and financial records they are authorised for. | `organization` | P1+P2 | S1 | S1-07 |
| `BRL-06` | Listings must contain the minimum required information before submission for approval. | `catalog` | P1 | S1 | S1-13 |
| `BRL-07` | Overlapping confirmed bookings for the same unit and dates are not permitted. | `availability` | P1 | S2 | S2-08 |
| `BRL-08` | Booking flow: Pending → Awaiting Payment (on owner acceptance) → Confirmed (only after verified payment). | `booking` | P1 | S2 | S2-07 |
| `BRL-09` | Unpaid bookings are automatically cancelled after the payment window expires (30 minutes); the unit is released. | `booking` | P1 | S2 | S2-07 |
| `BRL-10` | Declined, cancelled and expired bookings shall not block accommodation availability. | `availability` | P1 | S2 | S2-08 |
| `BRL-11` | A booking may be marked Completed only after the relevant stay has ended and check-out has been recorded. | `booking` | P1 | S2 | S2-12 |
| `BRL-12` | Only guests associated with completed bookings may submit reviews; one review per completed booking. | `review` | P1 | S3 | S3-06 |
| `BRL-13` | Administrators may hide or remove reported reviews through recorded moderation decisions. | `review` | P1 | S3 | S3-06 |
| `BRL-14` | Refunds follow the recorded cancellation policy and are never automatic. | `payments` | P1 | S3 | S3-01 |
| `BRL-15` | Duplicate payment notifications must not result in duplicate payment processing. | `payments` | P1+P2 | S2 | S2-11 |
| `BRL-16` | Income from confirmed booking payments shall be recorded against the relevant property. | `finance` | P1 | S3 | S3-04 |
| `BRL-17` | Only authorised property users may add or amend expense records. | `finance` | P1+P2 | S3 | S3-04 |
| `BRL-18` | Relevant users must be notified when booking, payment, verification, complaint, dispute or review statuses change. | `notification` | P1+P2 | S3 | S3-10 |
| `BRL-19` | Suspension and restoration decisions must be recorded in audit logs. | `audit` | P1 | S1 | S1-08 |
| `BRL-20` | Financial and administrative actions must create auditable records. | `audit` | P1+P2 | S3 | S3-11 |
