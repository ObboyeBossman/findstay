# FindStay — Functional Requirements (`UR-*`, `FR-*`)

> **Traceability:** Allocated across Sprints 1–5 in [`docs/scrum/scrum.md`](../../scrum/scrum.md).
> **Total Items:** 180

| ID | Requirement | Module | Phase | Sprint | Story |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `UR-A01` | Manage user accounts (create, suspend, restore). | `admin` | P1 | S1 | S1-16 |
| `UR-A02` | Review, approve, reject, suspend, restore or request corrections to property listings. | `verification` | P1 | S1 | S1-15 |
| `UR-A03` | Moderate platform content including reviews and reported listings. | `admin` | P1 | S3 | S3-06 |
| `UR-A04` | Manage complaints, disputes and support requests. | `support` | P1 | S3 | S3-07 |
| `UR-A05` | Manage transaction records and refund-related processes. | `payments` | P1 | S3 | S3-03 |
| `UR-A06` | View platform-wide operational dashboards and reports. | `reporting` | P1 | S3 | S3-09 |
| `UR-A07` | Inspect and maintain audit logs of significant actions. | `audit` | P1 | S1 | S1-08 |
| `UR-A08` | Manage platform settings. | `admin` | P1 | S1 | S1-16 |
| `UR-A09` | Respond to complaints and reported issues. | `support` | P1 | S3 | S3-07 |
| `UR-AC01` | Reconcile payment records. | `accounting` | P2 | S5 | S5-01 |
| `UR-AC02` | Record and manage expenses. | `accounting` | P2 | S5 | S5-01 |
| `UR-AC03` | Generate financial statements. | `accounting` | P2 | S5 | S5-01 |
| `UR-AC04` | Access relevant financial records. | `accounting` | P2 | S5 | S5-01 |
| `UR-AN01` | Strong security and administrator-only access. | `platform` | P1 | S1 | S1-06 |
| `UR-AN02` | Tamper-proof, auditable logs of significant actions. | `audit` | P1 | S1 | S1-08 |
| `UR-AN03` | Error monitoring to detect failed payments or notifications. | `platform` | P1 | S2 | S2-13 |
| `UR-AP01` | Browse vacant accommodation units. | `tenancy` | P2 | S4 | S4-02 |
| `UR-AP02` | Submit rental applications. | `tenancy` | P2 | S4 | S4-02 |
| `UR-AP03` | Upload supporting documents. | `tenancy` | P2 | S4 | S4-02 |
| `UR-AP04` | Track application status. | `tenancy` | P2 | S4 | S4-02 |
| `UR-G01` | Register, log in, log out and manage an account with email/phone, OTP verification and password recovery. | `identity` | P1 | S1 | S1-04 |
| `UR-G02` | Search for accommodation by location, town, area, campus, keyword or distance to campus/workplace. | `search` | P1 | S2 | S2-01 |
| `UR-G03` | Filter results by price range, accommodation type, amenities/facilities, availability, guest capacity and rating. | `search` | P1 | S2 | S2-02 |
| `UR-G04` | View detailed listings: photos, description, price, house rules, amenities, location on map, availability, verification status and reviews. | `search` | P1 | S3 | S3-08 |
| `UR-G05` | Save favourites and compare multiple properties side by side. | `search` | P1 | S3 | S3-08 |
| `UR-G06` | View recently viewed properties. | `search` | P1 | S3 | S3-08 |
| `UR-G07` | Submit a booking request for an available unit and date range; receive confirmation and booking status updates. | `booking` | P1 | S2 | S2-05 |
| `UR-G08` | Pay deposits/rent securely (Mobile Money, card) and download receipts. | `payments` | P1 | S2 | S2-09 |
| `UR-G09` | Modify or cancel bookings and request refunds according to applicable policy. | `booking` | P1 | S3 | S3-01 |
| `UR-G10` | Access digital booking vouchers and check-in information. | `booking` | P1 | S2 | S2-12 |
| `UR-G11` | Chat with or send enquiries to property owners/managers within the platform. | `messaging` | P1 | S3 | S3-05 |
| `UR-G12` | Receive notifications for booking, payment, verification and other relevant events. | `notification` | P1 | S2 | S2-13 |
| `UR-G13` | Submit ratings and reviews after completing an eligible stay. | `review` | P1 | S3 | S3-06 |
| `UR-G14` | Report fake, misleading or unsafe listings. | `support` | P1 | S3 | S3-07 |
| `UR-G15` | Submit complaints, disputes and support requests and track their status. | `support` | P1 | S3 | S3-07 |
| `UR-G16` | Manage profile, booking history and notification preferences. | `identity` | P1 | S2 | S2-13 |
| `UR-GN01` | Simple, intuitive interface navigable without training. | `platform` | P1 | S2 | S2-04 |
| `UR-GN02` | Mobile-first; works on low-end phones and slow (3G/4G) networks. | `platform` | P1 | S2 | S2-04 |
| `UR-GN03` | Verified listings and owners; personal and payment data kept private. | `platform` | P1 | S2 | S2-03 |
| `UR-GN04` | Search results returned within a few seconds; pages load quickly. | `platform` | P1 | S2 | S2-04 |
| `UR-GN05` | Platform accessible 24/7 with minimal downtime. | `platform` | P1 | S3 | S3-13 |
| `UR-M01` | Receive assigned maintenance jobs. | `maintenance` | P2 | S4 | S4-09 |
| `UR-M02` | Update maintenance job statuses. | `maintenance` | P2 | S4 | S4-09 |
| `UR-M03` | Upload maintenance photographs and submit invoices. | `maintenance` | P2 | S4 | S4-09 |
| `UR-O01` | Register, complete onboarding and submit identity and property documents for verification; track approval status. | `verification` | P1 | S1 | S1-12 |
| `UR-O02` | Create, edit, deactivate and manage property listings including photos, descriptions, units, prices, amenities, house rules and availability. | `catalog` | P1 | S1 | S1-14 |
| `UR-O03` | Manage property and unit availability calendars. | `availability` | P1 | S1 | S1-14 |
| `UR-O04` | Receive, review, accept or decline booking requests. | `booking` | P1 | S2 | S2-06 |
| `UR-O05` | Modify or cancel bookings according to applicable policy. | `booking` | P1 | S3 | S3-01 |
| `UR-O06` | View booking dashboard: upcoming, active, completed and cancelled reservations. | `booking` | P1 | S2 | S2-06 |
| `UR-O07` | Manage guest check-in and check-out. | `booking` | P1 | S2 | S2-12 |
| `UR-O08` | Track payments and booking income. | `finance` | P1 | S3 | S3-04 |
| `UR-O09` | Receive payouts for completed transactions. | `payments` | P1 | S3 | S3-02 |
| `UR-O10` | Record and manage operational expenses and expense categories. | `finance` | P1 | S3 | S3-04 |
| `UR-O11` | View income, expenses and net profit. | `finance` | P1 | S3 | S3-04 |
| `UR-O12` | Generate date-filtered occupancy and financial reports. | `reporting` | P1 | S3 | S3-09 |
| `UR-O13` | Communicate with guests via in-platform messaging. | `messaging` | P1 | S3 | S3-05 |
| `UR-O14` | Respond to eligible guest reviews. | `review` | P1 | S3 | S3-06 |
| `UR-O15` | Grant and manage access permissions for property staff. | `organization` | P1 | S1 | S1-07 |
| `UR-O16` | Report inaccurate or misleading guest-submitted information for administrative review. | `support` | P1 | S3 | S3-07 |
| `UR-ON01` | Simple, uncluttered interface suited to small providers. | `platform` | P1 | S1 | S1-03 |
| `UR-ON02` | Access limited to own properties and financial records. | `platform` | P1 | S1 | S1-07 |
| `UR-ON03` | Accurate, real-time availability and financial figures. | `platform` | P1 | S3 | S3-04 |
| `UR-ON04` | Dashboards load within 3 seconds. | `platform` | P1 | S3 | S3-09 |
| `UR-ON05` | Dependable service with backups so records are never lost. | `platform` | P1 | S1 | S1-02 |
| `UR-PM01` | Manage tenants, leases and rental records. | `tenancy` | P2 | S4 | S4-03 |
| `UR-PM02` | Manage reservations and availability for assigned properties. | `booking` | P1 | S2 | S2-06 |
| `UR-PM03` | Assign access permissions to authorised staff. | `organization` | P1 | S1 | S1-07 |
| `UR-PS01` | Access only properties and functions explicitly authorised by an owner/manager or administrator. | `organization` | P1 | S1 | S1-07 |
| `UR-PS02` | View and update authorised booking information. | `booking` | P1 | S2 | S2-06 |
| `UR-PS03` | Record guest check-in and check-out status. | `booking` | P1 | S2 | S2-12 |
| `UR-PS04` | Support guests with enquiries within authorised scope. | `messaging` | P1 | S3 | S3-05 |
| `UR-PSN01` | Restricted, role-limited access to protect sensitive data. | `organization` | P1 | S1 | S1-07 |
| `UR-PSN02` | Quick, easy-to-use screens for front-desk tasks. | `platform` | P1 | S2 | S2-12 |
| `FR-01` | Allow guests, owners/managers, property staff and administrators to create or receive accounts appropriate to their roles. | `identity` | P1+P2 | S1 | S1-04 |
| `FR-02` | Authenticate users before granting access to protected functions. | `identity` | P1 | S1 | S1-04 |
| `FR-03` | Support user login and logout. | `identity` | P1 | S1 | S1-04 |
| `FR-04` | Provide password reset and account recovery through a verified contact channel. | `identity` | P1 | S1 | S1-05 |
| `FR-05` | Support email or phone verification (OTP). | `identity` | P1 | S1 | S1-04 |
| `FR-06` | Allow users to view and update authorised profile information. | `identity` | P1 | S1 | S1-05 |
| `FR-07` | Enforce role-based access control (RBAC) and prevent access to unauthorised data or functions. | `identity` | P1+P2 | S1 | S1-06 |
| `FR-08` | Allow owners/managers to submit identity and property-verification information for review. | `verification` | P1 | S1 | S1-12 |
| `FR-09` | Support property-staff permissions explicitly granted by authorised owners/managers or administrators. | `organization` | P1 | S1 | S1-07 |
| `FR-10` | Support optional two-factor authentication. | `identity` | P1 | S3 | S3-12 |
| `FR-11` | Allow verified owners/managers to create property listings. | `catalog` | P1 | S1 | S1-13 |
| `FR-12` | Allow owners/managers to update existing property listings. | `catalog` | P1 | S1 | S1-13 |
| `FR-13` | Allow owners/managers to deactivate or pause property listings. | `catalog` | P1 | S1 | S1-13 |
| `FR-14` | Allow owners/managers to upload property photographs and listing images. | `catalog` | P1 | S1 | S1-13 |
| `FR-15` | Allow owners/managers to manage property descriptions, accommodation types, unit categories, capacity and quantities. | `catalog` | P1 | S1 | S1-13 |
| `FR-16` | Allow owners/managers to manage property amenities, facilities and house rules. | `catalog` | P1 | S1 | S1-13 |
| `FR-17` | Allow owners/managers to manage accommodation prices and rates. | `catalog` | P1 | S1 | S1-13 |
| `FR-18` | Allow owners/managers to manage property and unit availability. | `availability` | P1 | S1 | S1-14 |
| `FR-19` | Support property status management including vacant, occupied and under-maintenance. | `availability` | P1+P2 | S2 | S2-08 |
| `FR-20` | Display property and owner verification status to guests. | `verification` | P1 | S2 | S2-03 |
| `FR-21` | Publish a listing only after it meets verification and approval requirements set by administrators. | `verification` | P1 | S1 | S1-15 |
| `FR-22` | Validate required information before a listing is saved or published. | `catalog` | P1 | S1 | S1-13 |
| `FR-23` | Provide a searchable accommodation directory with keyword search and sorting. | `search` | P1 | S2 | S2-01 |
| `FR-24` | Allow guests to search by geographical location, town, area, campus or neighbourhood. | `search` | P1 | S2 | S2-01 |
| `FR-25` | Allow filtering by accommodation type. | `search` | P1 | S2 | S2-02 |
| `FR-26` | Allow filtering by price range. | `search` | P1 | S2 | S2-02 |
| `FR-27` | Allow filtering by amenities and facilities. | `search` | P1 | S2 | S2-02 |
| `FR-28` | Allow filtering by guest capacity. | `search` | P1 | S2 | S2-02 |
| `FR-29` | Allow filtering by intended stay dates / availability. | `search` | P1 | S2 | S2-02 |
| `FR-30` | Allow filtering by ratings where available. | `search` | P1 | S2 | S2-02 |
| `FR-31` | Display property photographs, descriptions, prices, unit options, facilities, house rules, availability and verification status. | `search` | P1 | S2 | S2-03 |
| `FR-32` | Provide property favourites / saved listings for signed-in users. | `search` | P1 | S3 | S3-08 |
| `FR-33` | Maintain a recently viewed property list. | `search` | P1 | S3 | S3-08 |
| `FR-34` | Provide a map-based property location identifier with distance calculation. | `search` | P1 | S2 | S2-03 |
| `FR-35` | Display appropriate messages when no search results are found. | `search` | P1 | S2 | S2-01 |
| `FR-36` | Allow guests to submit booking requests for available accommodation units. | `booking` | P1 | S2 | S2-05 |
| `FR-37` | Validate requested accommodation capacity and availability before accepting a booking request. | `booking` | P1 | S2 | S2-05 |
| `FR-38` | Calculate the total booking amount based on selected accommodation and dates. | `booking` | P1 | S2 | S2-05 |
| `FR-39` | Provide a real-time availability calendar. | `availability` | P1 | S1 | S1-14 |
| `FR-40` | Prevent overlapping confirmed reservations for the same accommodation unit and dates. | `availability` | P1 | S2 | S2-08 |
| `FR-41` | Temporarily hold accommodation availability during the booking process. | `availability` | P1 | S2 | S2-08 |
| `FR-42` | Allow authorised owners/managers or staff to accept or decline booking requests. | `booking` | P1 | S2 | S2-06 |
| `FR-43` | Support booking modification and cancellation by both guests and authorised property representatives. | `booking` | P1 | S3 | S3-01 |
| `FR-44` | Maintain booking status history: Pending → Awaiting Payment → Confirmed → Cancelled / Completed / Declined. | `booking` | P1 | S2 | S2-07 |
| `FR-45` | Automatically release held availability when a booking is declined, cancelled or expires. | `availability` | P1 | S2 | S2-08 |
| `FR-46` | Automatically cancel unpaid booking requests when the configured payment window expires (30 minutes). | `booking` | P1 | S2 | S2-07 |
| `FR-47` | Provide booking dashboards for guests and authorised property representatives. | `booking` | P1 | S2 | S2-06 |
| `FR-48` | Support tracking of upcoming, active, completed and cancelled reservations. | `booking` | P1 | S2 | S2-06 |
| `FR-49` | Support check-in and check-out status tracking. | `booking` | P1 | S2 | S2-12 |
| `FR-50` | Generate digital booking confirmations and receipts/vouchers (including QR codes). | `booking` | P1 | S2 | S2-12 |
| `FR-51` | Integrate with supported online payment gateways (Paystack Ghana). | `payments` | P1 | S2 | S2-09 |
| `FR-52` | Support MTN Mobile Money, Telecel Cash and AT Money payment channels. | `payments` | P1 | S2 | S2-09 |
| `FR-53` | Support bank-card payments. | `payments` | P1 | S2 | S2-09 |
| `FR-54` | Record payment transactions and associate them with their corresponding bookings. | `payments` | P1 | S2 | S2-10 |
| `FR-55` | Track payment statuses and verify payment results before confirming bookings. | `payments` | P1 | S2 | S2-10 |
| `FR-56` | Process payment-provider callbacks and validate webhook signatures (HMAC-SHA512 for Paystack). | `payments` | P1 | S2 | S2-11 |
| `FR-57` | Identify and reject duplicate payment notifications. | `payments` | P1 | S2 | S2-11 |
| `FR-58` | Support refund requests and cancellation-related financial processes. | `payments` | P1 | S3 | S3-01 |
| `FR-59` | Support payment reconciliation. | `payments` | P1+P2 | S3 | S3-03 |
| `FR-60` | Automatically record booking income against the relevant property. | `finance` | P1 | S3 | S3-04 |
| `FR-61` | Allow authorised users to record and manage property expenses and expense categories. | `finance` | P1 | S3 | S3-04 |
| `FR-62` | Calculate property revenue, expenses and net profit. | `finance` | P1 | S3 | S3-04 |
| `FR-63` | Support owner payouts for completed transactions. | `payments` | P1 | S3 | S3-02 |
| `FR-64` | Support recording of financial transactions and their statuses. | `payments` | P1 | S2 | S2-10 |
| `FR-65` | Provide in-app messaging between guests and authorised property representatives. | `messaging` | P1 | S3 | S3-05 |
| `FR-66` | Provide automated notifications for booking-related events (confirmations, status changes, cancellations). | `notification` | P1 | S2 | S2-13 |
| `FR-67` | Notify users about payment-status changes. | `notification` | P1 | S2 | S2-13 |
| `FR-68` | Notify relevant users about verification-status changes. | `notification` | P1 | S1 | S1-10 |
| `FR-69` | Provide email notifications. | `notification` | P1 | S1 | S1-10 |
| `FR-70` | Support SMS notifications. | `notification` | P1 | S1 | S1-10 |
| `FR-71` | Notify users about relevant account activities. | `notification` | P1 | S1 | S1-10 |
| `FR-72` | Support announcements and reminders (e.g. rent-due, lease-expiry) where applicable. | `notification` | P1+P2 | S3 | S3-10 |
| `FR-73` | Allow eligible guests (completed bookings only) to submit ratings and reviews; one review per completed booking. | `review` | P1 | S3 | S3-06 |
| `FR-74` | Allow property owners to respond to guest reviews. | `review` | P1 | S3 | S3-06 |
| `FR-75` | Allow administrators to moderate and remove reported reviews. | `review` | P1 | S3 | S3-06 |
| `FR-76` | Allow guests to submit complaints and disputes and track their status. | `support` | P1 | S3 | S3-07 |
| `FR-77` | Allow property representatives to submit support requests and disputes. | `support` | P1 | S3 | S3-07 |
| `FR-78` | Allow administrators to record, investigate and respond to complaints and disputes. | `support` | P1 | S3 | S3-07 |
| `FR-79` | Allow users to report listings that appear false, suspicious or inappropriate. | `support` | P1 | S3 | S3-07 |
| `FR-80` | Allow owners to report inaccurate or misleading guest-submitted information for review. | `support` | P1 | S3 | S3-07 |
| `FR-81` | Provide property-management dashboards. | `reporting` | P1 | S3 | S3-09 |
| `FR-82` | Provide a platform-administration dashboard. | `reporting` | P1 | S3 | S3-09 |
| `FR-83` | Generate occupancy, reservation, income, expense, net-profit and payment-activity reports. | `reporting` | P1 | S3 | S3-09 |
| `FR-84` | Allow reports to be filtered by selected dates or reporting periods. | `reporting` | P1 | S3 | S3-09 |
| `FR-85` | Support report exports in PDF, CSV and Excel formats. | `reporting` | P1 | S3 | S3-09 |
| `FR-86` | Provide a dedicated administrative dashboard. | `admin` | P1 | S1 | S1-16 |
| `FR-87` | Allow administrators to manage users and accounts. | `admin` | P1 | S1 | S1-16 |
| `FR-88` | Allow administrators to manage property submissions: approve, reject, suspend, restore or request corrections. | `admin` | P1 | S1 | S1-15 |
| `FR-89` | Allow administrators to manage transactions and refund-related processes. | `admin` | P1 | S3 | S3-03 |
| `FR-90` | Allow administrators to moderate platform content. | `admin` | P1 | S3 | S3-06 |
| `FR-91` | Allow administrators to manage complaints and disputes. | `admin` | P1 | S3 | S3-07 |
| `FR-92` | Allow administrators to manage platform settings. | `admin` | P1 | S1 | S1-16 |
| `FR-93` | Maintain audit logs for significant administrative, verification, booking-status and financial actions, identifying the action, user and date/time. | `audit` | P1 | S3 | S3-11 |
| `FR-94` | Provide platform-wide operational reports. | `reporting` | P1 | S3 | S3-09 |
| `FR-95` | Provide an AI-assisted support contact as a first-response layer for common user queries. | `assistant` | P2 | S5 | S5-04 |
| `FR-96` | Allow unresolved AI-assisted queries to be escalated to human administrators. | `assistant` | P2 | S5 | S5-04 |
| `FR-97` | Allow maintenance requests to be received, recorded and assigned. | `maintenance` | P2 | S4 | S4-08 |
| `FR-98` | Support maintenance-ticket creation, priority management and scheduling. | `maintenance` | P2 | S4 | S4-08 |
| `FR-99` | Allow maintenance staff to update job statuses, upload photographs and submit invoices. | `maintenance` | P2 | S4 | S4-09 |
| `FR-100` | Support maintenance cost tracking and vendor management. | `maintenance` | P2 | S4 | S4-10 |
| `FR-101` | Allow property managers to manage tenants and create/manage lease agreements. | `tenancy` | P2 | S4 | S4-03 |
| `FR-102` | Support lease renewals and terminations. | `tenancy` | P2 | S4 | S4-04 |
| `FR-103` | Support rental applications, applicant screening and document uploads. | `tenancy` | P2 | S4 | S4-02 |
| `FR-104` | Support digital lease signing and security-deposit management. | `tenancy` | P2 | S4 | S4-05 |
| `FR-105` | Support recurring rental invoicing, billing, rent tracking and arrears management. | `rent` | P2 | S4 | S4-06 |
| `FR-106` | Support late-fee management and generation of rental notices and reminders. | `rent` | P2 | S4 | S4-07 |
