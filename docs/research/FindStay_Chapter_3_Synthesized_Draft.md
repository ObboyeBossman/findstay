# FindStay - Chapter Three: Requirements Analysis

**Project context:** Proposed web-based accommodation marketplace and property-management system  
**Status:** Approved requirements baseline for design and implementation planning

## 3.1 Introduction

This chapter translates the FindStay concept into requirements that can be designed, implemented, tested, and evaluated. It identifies the stakeholders, defines system functions and quality requirements, establishes business rules, describes major use cases, evaluates feasibility, and links key requirements to later testing. The chapter intentionally remains independent of a specific programming language, framework, or cloud provider; technology selection will be made after the requirements baseline is agreed.

## 3.2 Stakeholder Analysis

| Stakeholder | Role and interest | Main system needs |
| --- | --- | --- |
| Guests | Find, assess, book, pay for, and manage accommodation stays | Accurate listings, availability, secure payment, confirmations, communication, reviews, and support |
| Property owners/managers | Publish and operate one or more properties | Verification, listing and unit management, calendar, bookings, payments, guest information, expenses, and reports |
| Property staff | Carry out delegated property operations | Restricted access to authorised property information, check-in/out, booking updates, and guest support |
| Platform administrators | Maintain trust, safety, and platform operations | Verification queues, moderation, user and transaction controls, complaints, disputes, audit logs, and reporting |
| Payment-service providers | Process transactions and payment events | Secure gateway requests, validated payment records, reconciliation, and compliant callbacks |
| Ghana tourism and regulatory bodies | Set or administer relevant standards and licensing requirements | Accurate business information and procedures aligned with applicable requirements |
| Project team and institution | Build, assess, maintain, and evaluate the system | Clear requirements, test evidence, documentation, and a working deployment |

## 3.3 Functional Requirements

### Account, identity, and access management

| ID | Requirement |
| --- | --- |
| FR-01 | The system shall allow guests, owners/managers, property staff, and administrators to create or receive accounts appropriate to their roles. |
| FR-02 | The system shall authenticate users before granting access to protected functions. |
| FR-03 | The system shall provide password reset and account-recovery functions through a verified contact channel. |
| FR-04 | The system shall enforce role-based access control and prevent users from accessing unauthorised data or functions. |
| FR-05 | The system shall allow users to view and update their own authorised profile information. |
| FR-06 | The system shall allow an owner/manager to submit identity and property-verification information for administrative review. |

### Property discovery and listing management

| ID | Requirement |
| --- | --- |
| FR-07 | The system shall allow verified owners/managers to create, update, deactivate, and manage property listings. |
| FR-08 | The system shall allow owners/managers to manage accommodation units, capacity, prices, amenities, house rules, images, and availability. |
| FR-09 | The system shall allow guests to search and filter published listings by location, property type, dates, guest capacity, price range, amenities, and rating where available. |
| FR-10 | The system shall display listing details, unit options, availability, prices, photographs, facilities, house rules, verification status, and review summaries. |
| FR-11 | The system shall allow guests to save and remove favourite listings. |
| FR-12 | The system shall publish a listing only after it has met the platform's verification and approval requirements. |

### Booking, payments, communication, and feedback

| ID | Requirement |
| --- | --- |
| FR-13 | The system shall allow a guest to create a booking request for an available accommodation unit and date range. |
| FR-14 | The system shall prevent conflicting confirmed bookings for the same unit and overlapping dates. |
| FR-15 | The system shall allow authorised property staff to accept, decline, modify, or cancel booking requests according to the applicable booking policy. |
| FR-16 | The system shall record booking status, including Pending, Awaiting Payment, Confirmed, Cancelled, Completed, and Declined. |
| FR-17 | The system shall integrate supported online payment method(s), record payment status, and associate each transaction with its booking. |
| FR-18 | The system shall issue a digital booking confirmation and receipt after successful payment and confirmation conditions are satisfied. |
| FR-19 | The system shall support cancellation, refund-request, and payment-reconciliation workflows according to platform and property policies. |
| FR-20 | The system shall send in-app and email notifications for important account, listing, booking, payment, cancellation, review, and support events. |
| FR-21 | The system shall enable reservation-related messaging between guests and authorised property representatives. |
| FR-22 | The system shall allow eligible guests to submit ratings and reviews after a completed stay, and allow owners and administrators to respond to or moderate reported reviews. |
| FR-23 | The system shall allow guests and property representatives to submit support requests, complaints, and disputes and track their status. |

### Property operations, finance, and administration

| ID | Requirement |
| --- | --- |
| FR-24 | The system shall provide owners/managers with a calendar and dashboard for managing upcoming, active, completed, and cancelled bookings. |
| FR-25 | The system shall allow authorised property staff to record check-in and check-out status where applicable. |
| FR-26 | The system shall allow owners/managers to record income, expenses, expense categories, and payment status for their own properties. |
| FR-27 | The system shall generate date-filtered reports for reservations, occupancy, revenue, expenses, net position, and payment activity. |
| FR-28 | The system shall allow administrators to approve, reject, suspend, restore, or request changes to owner and property submissions. |
| FR-29 | The system shall allow administrators to manage user accounts, listings, reviews, complaints, disputes, and transaction records in accordance with authorised procedures. |
| FR-30 | The system shall record auditable logs for significant administrative, verification, booking-status, and financial actions. |

## 3.4 Non-Functional Requirements

| ID | Quality requirement |
| --- | --- |
| NFR-01 | The system shall use authenticated and role-authorised access for protected data and functions. |
| NFR-02 | The system shall protect passwords and sensitive data in transit and at rest using industry-standard security controls appropriate to the selected technology. |
| NFR-03 | The system shall validate user input and protect against common web-application threats, including unauthorised access, injection, cross-site scripting, and insecure direct-object access. |
| NFR-04 | The system shall not store raw payment-card data; payment information shall be handled through an approved payment-service provider. |
| NFR-05 | Under normal expected use, public listing-search results and standard dashboard views should return within three seconds, excluding external payment-provider delays. |
| NFR-06 | The system shall preserve booking and payment consistency; a failed or duplicate payment event shall not create duplicate confirmed bookings. |
| NFR-07 | The system shall be responsive and usable on current mobile and desktop web browsers. |
| NFR-08 | The system shall use clear labels, readable text, visible status messages, and accessible form controls. |
| NFR-09 | The system shall maintain audit records for significant account, verification, booking, payment, and administrative events. |
| NFR-10 | The system shall provide backups and a documented restoration procedure for production data. |
| NFR-11 | The system shall provide error logging and monitoring sufficient to identify failed payments, failed notifications, and critical application errors. |
| NFR-12 | The system shall be modular enough to support additional properties, users, accommodation units, and future integrations without redesigning the core data model. |
| NFR-13 | The system shall comply with applicable data-protection, tourism, and payment-provider obligations for its intended operating context. |
| NFR-14 | The system shall provide maintainable documentation for deployment, administration, and key user workflows. |

## 3.5 Business Rules

1. A user must be authenticated before accessing protected account, booking, financial, messaging, review, or administrative functions.
2. Each account shall have one primary role. Additional property-staff access must be explicitly granted by an authorised owner/manager or administrator.
3. Owners/managers may create draft listings, but only administrator-approved listings may be publicly searchable and bookable.
4. Owners/managers and property staff may access only the properties and financial records for which they have been authorised.
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

## 3.6 Major Use Cases

| Use case | Primary actor | Preconditions | Success outcome |
| --- | --- | --- | --- |
| UC-01 Register and access account | Guest, owner/manager, administrator | User has a valid contact channel | Account is created or activated and the user receives the appropriate role access |
| UC-02 Submit property for verification | Owner/manager | Owner account is authenticated | Property submission enters the administrator verification queue |
| UC-03 Search and view accommodation | Guest | Published listings exist | Guest views filtered results and detailed listing information |
| UC-04 Request, pay for, and confirm booking | Guest, owner/manager, payment provider | Guest is authenticated; selected unit is available | Accepted booking is paid, confirmed, receipted, and added to both dashboards |
| UC-05 Manage property availability and bookings | Owner/manager or authorised staff | User has access to the property | Availability, booking status, and guest stay information are updated |
| UC-06 Record financial activity and view reports | Owner/manager | User has access to the property | Income/expenses are recorded and date-filtered reports are generated |
| UC-07 Review completed stay or report issue | Guest | Guest has an eligible completed booking or support need | Review, complaint, or dispute is recorded and routed for action |
| UC-08 Verify, moderate, and administer platform | Administrator | Administrator is authenticated and authorised | Verification, moderation, account, complaint, dispute, or transaction action is completed and logged |

### UC-04: Request, Pay for, and Confirm Booking

1. The guest selects a property unit, check-in date, check-out date, and number of guests.
2. The system validates capacity and availability and calculates the booking amount.
3. The guest submits the request and the system records it as Pending.
4. The owner/manager accepts or declines the request. On acceptance, the system changes it to Awaiting Payment and notifies the guest.
5. The guest selects a supported payment method and completes payment through the payment provider.
6. The system verifies the payment result, records the transaction, changes the booking to Confirmed, and issues a confirmation and receipt.
7. If the request is declined, the payment fails, or the payment window expires, the system records the relevant status and notifies affected users.

## 3.7 Feasibility Study

### Technical feasibility

FindStay is technically feasible because its core functions - authentication, listings, search, calendars, booking workflows, online payments, notifications, dashboards, and reporting - are established web-application capabilities. The main technical challenge is ensuring that availability, payment events, booking status, and financial records remain consistent. A modular design, role-based authorisation, transaction-safe booking workflow, payment-provider callbacks, testing, monitoring, and backup procedures are therefore required.

### Operational feasibility

The system is operationally feasible because it serves clearly defined users with identifiable workflows: guests find and book stays; owners manage properties and operations; and administrators verify and govern platform activity. Success will require owner onboarding, verification procedures, usable dashboards, support processes, and clear cancellation, refund, review, and dispute policies. User-acceptance testing with intended guests and accommodation providers will validate whether the workflows are understandable in practice.

### Economic feasibility

The project requires planned spending on a domain, production hosting, database and media storage, email or SMS notifications, payment-gateway charges, security controls, and maintenance. A group approach makes the workload and costs shareable across team members. The team should prepare a budget, select appropriate service plans, and monitor recurring costs. Financial constraints require prioritisation and planning, but do not remove the requirement to deliver a working system for real users.

### Schedule feasibility

Schedule feasibility depends on managing the work as phases: requirements and design; database and core account functions; listing and search; booking and payments; owner and administrator operations; testing and security review; deployment; and user evaluation. Each phase must have a named owner, measurable deliverables, and integration checkpoints. High-risk functions such as payments, bookings, permissions, and verification should be built and tested early rather than deferred to the final phase.

### Legal, security, and organisational feasibility

The project is feasible if it incorporates applicable data-protection responsibilities, payment-provider requirements, and relevant tourism business verification practices into the implementation and operating procedures. The team must define who has authority to approve listings, handle personal data, access financial information, moderate reviews, respond to complaints, and release refunds. These controls are necessary for a real-user deployment and are reflected in the requirements and business rules above.

## 3.8 Requirements Traceability Summary

| Requirement area | Representative requirements | Key use cases | Verification evidence |
| --- | --- | --- | --- |
| Accounts and access | FR-01 to FR-06; NFR-01 to NFR-04 | UC-01, UC-02, UC-08 | Authentication, role-permission, account recovery, and authorisation tests |
| Listings and search | FR-07 to FR-12; NFR-05, NFR-07, NFR-08 | UC-02, UC-03 | Listing lifecycle, search/filter, responsiveness, and verification tests |
| Booking and payments | FR-13 to FR-20; NFR-04 to NFR-06 | UC-04, UC-05 | Availability-conflict, status-transition, payment callback, receipt, and notification tests |
| Communication and trust | FR-21 to FR-23; NFR-09 | UC-07, UC-08 | Messaging, review-eligibility, complaint, moderation, and audit-log tests |
| Owner operations and administration | FR-24 to FR-30; NFR-09 to NFR-14 | UC-05, UC-06, UC-08 | Calendar, report, access-isolation, administrative-action, backup, and monitoring tests |

## 3.9 Chapter Summary

This chapter establishes the requirements baseline for FindStay. The functional requirements define what the system must do for guests, owners/managers, staff, and administrators. The non-functional requirements define the required security, performance, usability, reliability, maintainability, and compliance qualities. The business rules define the platform's booking, payment, verification, review, financial, and access-control decisions. These requirements will guide the next stage: system design and technology selection.
