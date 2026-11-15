# FindStay — Non-Functional Requirements (`NFR-*`)

> **Traceability:** Allocated across Sprints 1–5 in [`docs/scrum/scrum.md`](../../scrum/scrum.md).
> **Total Items:** 66

| ID | Requirement | Module | Phase | Sprint | Story |
| :--- | :--- | :--- | :---: | :---: | :---: |
| `NFR-01` | Simple, intuitive, user-friendly interface requiring minimal training. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-02` | Clear labels, consistent navigation and understandable instructions. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-03` | Visible status messages and feedback for user actions. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-04` | Accessible form controls. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-05` | Icon-based navigation. | `platform` | P1 | S1 | S1-03 |
| `NFR-06` | Text-to-speech functionality. | `platform` | P2 | S5 | S5-05 |
| `NFR-07` | Interface accommodates users with low literacy or colour-vision difficulties. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-08` | Financial information presented in an easy-to-understand format. | `platform` | P1+P2 | S3 | S3-04 |
| `NFR-09` | Responsive interface for mobile phones, tablets and desktop devices. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-10` | Supports modern web browsers (Chrome, Edge, Firefox, Safari). | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-11` | Content and financial information remain readable on smaller screens. | `platform` | P1+P2 | S3 | S3-04 |
| `NFR-12` | No unnecessary horizontal scrolling on mobile devices. | `platform` | P1+P2 | S1 | S1-03 |
| `NFR-13` | Public listing search results and standard dashboard views return within 3 seconds under normal use. | `platform` | P1+P2 | S2 | S2-04 |
| `NFR-14` | Search results return within 2 seconds (target). | `platform` | P1 | S2 | S2-04 |
| `NFR-15` | Supports at least 1,000 concurrent users. | `platform` | P1 | S3 | S3-13 |
| `NFR-16` | Acceptable performance maintained on slow mobile internet connections (3G/4G). | `platform` | P1+P2 | S2 | S2-04 |
| `NFR-17` | Property photographs optimised to reduce loading time and mobile data consumption (WebP format). | `platform` | P1 | S1 | S1-09 |
| `NFR-18` | Efficient booking and availability checks maintained under concurrent requests. | `platform` | P1 | S2 | S2-08 |
| `NFR-19` | Authenticate users before granting access to protected resources. | `platform` | P1+P2 | S1 | S1-04 |
| `NFR-20` | Enforce role-based authorisation (RBAC). | `platform` | P1+P2 | S1 | S1-06 |
| `NFR-21` | Protect sensitive information during transmission (HTTPS/TLS) and storage (encryption at rest). | `platform` | P1+P2 | S1 | S1-06 |
| `NFR-22` | Secure password hashing managed by Supabase Auth; FindStay never stores or hashes passwords. | `platform` | P1+P2 | S1 | S1-04 |
| `NFR-23` | Validate user input; protect against SQL injection and cross-site scripting (XSS). | `platform` | P1+P2 | S1 | S1-06 |
| `NFR-24` | Prevent unauthorised direct access to protected records. | `platform` | P1+P2 | S1 | S1-06 |
| `NFR-25` | Protect payment transactions against fraudulent or falsified payment notifications. | `platform` | P1+P2 | S2 | S2-11 |
| `NFR-26` | Never store raw payment-card information. | `platform` | P1+P2 | S2 | S2-09 |
| `NFR-27` | Protect confidential application credentials and secret keys (environment variables, not source code). | `platform` | P1+P2 | S1 | S1-02 |
| `NFR-28` | Protect sensitive identity information including Ghana Card details. | `platform` | P1+P2 | S1 | S1-12 |
| `NFR-29` | Support optional two-factor authentication. | `platform` | P1 | S3 | S3-12 |
| `NFR-30` | PCI-DSS aligned payment security. | `platform` | P1 | S3 | S3-13 |
| `NFR-31` | Protect users' personal and financial information. | `platform` | P1+P2 | S1 | S1-11 |
| `NFR-32` | Comply with Ghana's Data Protection Act, 2012 (Act 843). | `platform` | P1+P2 | S1 | S1-11 |
| `NFR-33` | Comply with applicable payment-provider requirements. | `platform` | P1+P2 | S2 | S2-09 |
| `NFR-34` | Follow relevant tourism business verification and regulatory requirements. | `platform` | P1 | S1 | S1-12 |
| `NFR-35` | Restrict personal and financial information to authorised users only. | `platform` | P1+P2 | S1 | S1-11 |
| `NFR-36` | Collect only necessary personal information; obtain user consent for data collection. | `platform` | P1+P2 | S1 | S1-11 |
| `NFR-37` | Maintain reliable booking and payment records. | `platform` | P1+P2 | S2 | S2-10 |
| `NFR-38` | Prevent duplicate confirmed bookings. | `platform` | P1 | S2 | S2-08 |
| `NFR-39` | Failed or duplicate payment events must not create duplicate confirmed bookings. | `platform` | P1 | S2 | S2-11 |
| `NFR-40` | Maintain consistent financial and booking records during concurrent activity. | `platform` | P1+P2 | S2 | S2-10 |
| `NFR-41` | 99.5% uptime target (S1); 99% monthly uptime target (S2, S3). | `platform` | P1+P2 | S3 | S3-13 |
| `NFR-42` | Provide automatic database backups (daily) and a documented restoration procedure. | `platform` | P1+P2 | S1 | S1-02 |
| `NFR-43` | Provide error logging and monitoring. | `platform` | P1+P2 | S1 | S1-02 |
| `NFR-44` | Support recovery from application and infrastructure failures. | `platform` | P1+P2 | S3 | S3-13 |
| `NFR-45` | Support large growth in properties, rooms, users, and owners while keeping the system fast and responsive. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-46` | Easily add new accommodation types (such as student hostels) without rewriting or redesigning core system code. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-47` | Cloud-based architecture that scales as users, cities and listings grow. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-48` | Modular structure accommodating future integrations. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-49` | Maintain accurate property, booking and financial information. | `platform` | P1+P2 | S2 | S2-14 |
| `NFR-50` | Prevent duplicate payment transactions from being processed as separate successful payments. | `platform` | P1+P2 | S2 | S2-11 |
| `NFR-51` | Preserve the relationship between booking records and their payment transactions. | `platform` | P1+P2 | S2 | S2-10 |
| `NFR-52` | Maintain accurate booking dates and times in Ghana local time (GMT). | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-53` | Significant financial and administrative changes shall be traceable. | `platform` | P1+P2 | S3 | S3-11 |
| `NFR-54` | Modular, documented architecture enabling easy updates and integration. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-55` | Provide technical and operational documentation. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-56` | Support automated testing. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-57` | Maintain version-controlled source code. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-58` | Support future maintenance and enhancements without major architectural redesign. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-59` | Integration capabilities for supported payment gateways. | `platform` | P1 | S2 | S2-09 |
| `NFR-60` | Communication-service integrations: email and SMS providers. | `platform` | P1 | S1 | S1-10 |
| `NFR-61` | Support integration with external accounting tools where required. | `platform` | P2 | S5 | S5-02 |
| `NFR-62` | Support calendar integrations where required. | `platform` | P2 | S5 | S5-06 |
| `NFR-63` | Provide REST API-based integration capabilities. | `platform` | P1+P2 | S1 | S1-01 |
| `NFR-64` | Maintain auditable records of significant financial transactions. | `audit` | P1+P2 | S3 | S3-11 |
| `NFR-65` | Maintain records of important booking, reservation and administrative changes. | `audit` | P1+P2 | S3 | S3-11 |
| `NFR-66` | Audit records shall identify the action, user and date/time. | `audit` | P1+P2 | S1 | S1-08 |
