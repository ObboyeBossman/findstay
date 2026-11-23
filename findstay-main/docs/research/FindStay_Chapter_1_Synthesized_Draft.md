# FindStay - Chapter One: Introduction

**Project context:** Proposed academic software-engineering project  
**Geographical focus:** Ghana, with Takoradi as the proposed pilot context  
**Status:** Synthesized working draft - not yet inserted into the project PDF

## Editorial decisions used in this draft

- Ghana-wide evidence is used to establish the national context. Takoradi is presented as the proposed initial context, not as the source of unsupported statistics.
- The prototype will use a reservation-request workflow. It will not process live card or Mobile Money payments in version one.
- A review/rating system, native mobile app, map integration, AI recommendations, multi-language support, and external booking-channel synchronisation are future enhancements, not core features.
- The system is designed for guests, property owners/managers, and platform administrators.

## 1.1 Background of the Study

Digital technology has changed the way travellers discover, compare, and reserve accommodation. Instead of relying only on travel agents, telephone calls, or walk-in enquiries, guests can use digital platforms to access property descriptions, prices, available facilities, and booking information before travelling. Digital systems also support accommodation providers by helping them manage reservations, availability, customer records, and operational information.

In Ghana, the online visibility of tourism and accommodation businesses remains uneven. A digital diagnostic of the Ghanaian tourism sector reported that only 50 percent of hotels had claimed their Google Business Profile and only 29 percent had their own websites. This indicates that a considerable number of accommodation providers may be difficult for prospective guests to discover and evaluate online. The same diagnostic identifies data and digital technology as important to the development of Ghana's tourism sector.[^1]

Domestic travel also demonstrates the relevance of dependable accommodation information. The Ghana Statistical Service reported that Ghana recorded about 8.8 million domestic overnight visitors in 2023. This figure does not measure demand for a specific booking application or for Takoradi alone; however, it establishes that domestic overnight travel is substantial and that accessible accommodation information is relevant in the Ghanaian context.[^2]

For guests, accommodation information may be scattered across phone calls, social-media pages, personal referrals, and separate online channels. This can make it difficult to compare options, establish the availability of a property for intended dates, and obtain a clear reservation record. For small accommodation providers, managing bookings, availability, income, and expenses through disconnected processes can make day-to-day operations and reporting more difficult.

FindStay is proposed as a web-based, two-sided accommodation platform for the Ghanaian context, with Takoradi as its proposed initial local focus. The system will enable guests to search, compare, book, and pay for stays in hotels, guesthouses, hostels, and serviced apartments. It will also provide property owners and managers with tools to manage listings, availability, reservations, income, expenses, and reports. By bringing guest discovery and property management together in one system, FindStay is intended to provide a practical, deployable system for the accommodation sector.

## 1.2 Problem Statement

Accommodation seekers may encounter fragmented property information, inconsistent details about prices and facilities, and uncertainty about availability when information is spread across informal or disconnected channels. This can make it difficult to identify suitable accommodation, compare alternatives, and obtain a reliable reservation confirmation.

On the provider side, small accommodation owners and managers may use manual or disconnected methods to record reservations, update availability, track income, and record expenses. These methods can lead to inaccurate availability information, lost or duplicated records, and limited visibility into occupancy and financial performance. Ghana's uneven digital visibility among accommodation providers further strengthens the case for tools that support both public discoverability and day-to-day property administration.[^1]

The core problem is therefore the absence of an integrated and accessible platform that supports both accommodation seekers and small accommodation providers within the proposed project context. FindStay will address this by providing a searchable accommodation directory, booking and payment workflow for guests, together with listing, availability, reservation, income, expense, and reporting tools for property owners and managers.

## 1.3 Aim of the Project

To design and develop FindStay, a web-based accommodation discovery and property-management platform that enables guests to search, compare, book, and pay for verified accommodation, while enabling property owners and managers to manage listings, availability, reservations, income, expenses, and operational reports.

## 1.4 Project Objectives

1. To design and implement secure registration, login, and role-based access control for guests, property owners/managers, and administrators.
2. To develop a searchable accommodation directory that enables guests to filter listings by location, property type, price range, facilities, and intended stay dates.
3. To enable property owners and managers to create, update, and manage property listings, accommodation units, prices, amenities, and availability.
4. To implement a reservation and payment workflow through which guests can make, modify, or cancel reservations, complete supported online payments, and receive booking confirmations and receipts while preventing conflicting reservations for the same unit and dates.
5. To develop an income and expense-recording module for property owners and managers, including transaction and payment-status tracking.
6. To provide dashboards and reports that summarise reservations, occupancy, income, and expenses for selected periods.
7. To implement an administrator module for verifying property submissions, managing user accounts and transactions, moderating content, and recording or responding to complaints.
8. To evaluate the system's functionality, security controls, performance, and usability through defined test cases and user-acceptance testing.

## 1.5 Significance of the Project

FindStay is expected to give guests a single platform for discovering and comparing accommodation, reviewing standardised property information, and submitting reservation requests. This is intended to reduce the effort of searching through multiple disconnected channels and to provide a clearer reservation record.

For property owners and managers, the system is expected to offer a more structured way to maintain property listings, track booking requests, update availability, record income and expenses, and view basic operational reports. The prototype is intended to be approachable for smaller providers that may not require, or be able to adopt, a complex enterprise property-management system.

For platform administrators, FindStay provides a defined workflow for reviewing submitted listings, managing accounts, and recording complaints. This is intended to support accountability and improve the consistency of information available to guests.

Academically, the project provides a practical application of software-engineering concepts, including requirements analysis, role-based access control, data modelling, reservation workflows, reporting, and system testing. It also offers a documented prototype that may inform future work on accommodation-discovery and property-management systems in comparable local contexts.

## 1.6 Scope of the Project

The initial deployed release of FindStay will be a responsive web application focused on Ghana, with Takoradi as the proposed local test context. It will support the complete accommodation journey from discovery to booking, payment, communication, stay management, and post-stay feedback.

### In-scope users

- **Guests:** Register and manage accounts, discover accommodation, book and pay for stays, communicate with properties, manage reservations, submit reviews, and seek support.
- **Property owners/managers:** Complete onboarding and verification; manage properties, units, rates, availability, reservations, payments, guest communication, income, expenses, and reports.
- **Administrators:** Verify users and properties; manage accounts, content, transactions, complaints, disputes, platform settings, and operational reports.

### In-scope accommodation types

- Hotels and budget hotels
- Guesthouses
- Student hostels
- Serviced or short-stay apartments

### In-scope capabilities

#### Account, identity, and access management

- Secure account registration, login, logout, password reset, email or phone verification, and profile management
- Role-based access control for guests, owners/managers, property staff, and administrators
- Owner onboarding, identity verification, property-document submission, and approval status tracking

#### Accommodation discovery and listing experience

- Search and filtering by location, property type, price range, facilities, guest capacity, rating, and intended stay dates
- Listing pages containing descriptions, photographs, amenities, room or unit types, house rules, location details, prices, availability, and review summaries
- Favourites or saved listings and recently viewed properties
- Property, room/unit, amenity, image, price, house-rule, and availability management for owners/managers

#### Availability, booking, and stay management

- Real-time availability calendar with conflict checks that prevent overlapping confirmed reservations for the same unit and dates
- Booking creation, confirmation, modification, cancellation, booking-status history, and digital booking confirmations
- Guest and property-manager dashboards for managing upcoming, active, completed, and cancelled reservations
- Check-in and check-out status tracking where applicable to the property type

#### Payments, communication, and guest support

- Integrated online payment processing through supported payment gateway(s), including payment-status tracking and digital receipts
- Payment records, refund or cancellation-request handling in accordance with platform policy, and transaction history
- In-app and email notifications for bookings, payments, cancellations, messages, and account actions
- Guest-owner messaging for reservation-related enquiries and updates
- Complaints, dispute, and support-request submission with status tracking

#### Reviews, trust, and quality control

- Post-stay ratings and reviews for eligible completed reservations
- Owner response and administrator moderation of reported reviews or listings
- Property and owner verification badges/statuses displayed where approval requirements are met

#### Owner operations and reporting

- Reservation calendar, booking management, availability controls, and guest information access for authorised property staff
- Income, expense, and payment-status recording with configurable expense categories
- Operational dashboards and reports for occupancy, reservations, revenue, expenses, net position, and payment activity over selected dates

#### Administration and platform operations

- User, property, listing, review, complaint, dispute, and transaction management
- Listing approval, suspension, restoration, and content-moderation workflows
- Platform-level dashboards for users, properties, bookings, payments, complaints, and key operational activity
- Audit logs for significant administrative and financial actions, secure media storage, backup procedures, and error monitoring
- Responsive, accessible web interface with data-protection controls and secure handling of user information

## 1.7 Limitations of the Project

FindStay will be developed as a functional system for real users. However, its development and operation may be affected by the following practical limitations:

- **Financial and infrastructure constraints:** Funding may affect the choice of hosting plan, storage capacity, domain services, communication services, and the cost of third-party integrations. The team must plan and allocate available resources carefully.
- **Third-party service dependencies:** Features such as payment processing, email or SMS notifications, and cloud storage depend on external providers, their APIs, account approval processes, service availability, and transaction charges.
- **Data accuracy and verification:** The usefulness of accommodation listings depends on owners supplying accurate descriptions, prices, photographs, and availability. Verification and moderation procedures are needed to reduce misleading or outdated information.
- **Internet connectivity:** Guests and property managers require reliable internet access to use the web application. Poor or unstable connectivity may affect real-time booking updates and access to the platform.
- **Security, privacy, and compliance:** The system will handle user and property information and may process payment-related data. It must therefore meet applicable security, privacy, and payment-provider requirements, which require continuous attention throughout development and operation.
- **User onboarding and adoption:** The value of the platform depends on attracting and supporting both accommodation providers and guests. Training, clear interfaces, and responsive support may be required during adoption.

These limitations define areas that require planning, risk management, and shared team responsibility; they do not reduce the requirement to deliver a functional system.

## References

[^1]: Cenfri. (2023). *Digitising destinations: A tourist's journey starts online.* https://cenfri.org/articles/digitising-destinations-a-tourists-journey-starts-online/  
[^2]: Ghana Statistical Service. (2025). *Domestic overnight visitors: 2023 Domestic and Outbound Tourism Survey.* https://www.statsghana.gov.gh/gssmain/fileUpload/pressrelease/Domestic_Overnight_Visitors_Final%20Report_16_DECEMBER_2025.pdf
