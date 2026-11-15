# FindStay — Sprint 1 Acceptance Criteria & Story Breakdown (S1-01 to S1-17)

| | |
| :--- | :--- |
| **Sprint** | Sprint 1 (Weeks 1–2) — Release `R1` |
| **Scope** | 17 Stories (`S1-01` – `S1-17`) · 108 Requirements |
| **Settled Decisions** | `J-06`, `P-02`, `P-04`, `P-08`, `P-09`, `P-12` (see [`.rules/05-settled-decisions.md`](../../.rules/05-settled-decisions.md)) |

---

## S1-01: Project setup & system design

- **Who this helps:** Development team (so all 11 members can build without conflicts)
- **Area:** Platform Setup | **Priority:** Must have | **Track:** Track A | **Days:** Day 1 – Day 3
- **Summary:** Set up the starter website, backend server, and database folders, and write the database and screen designs before feature coding begins.
- **Screens involved:** Starter shell routes for Owner Portal (/owner), Admin Portal (/admin), and Guest Portal (/)
- **Database tables:** Starter Flyway migration setup (V1_01), shared settings & lookup tables
- **System actions:** Health check (/actuator/health), shared Ghana Cedi/pesewa money helper, Ghana GMT time helper, and module boundary check
- **Linked Requirements (16):** `TA-01`, `TA-02`, `NFR-45`, `NFR-46`, `NFR-47`, `NFR-48`, `NFR-52`, `NFR-54`, `NFR-55`, `NFR-56`, `NFR-57`, `NFR-58`, `NFR-63`, `PD-01`, `PD-02`, `PD-07`

### What Proves This Story Is Finished

1. The website, backend server, and database folders are set up and connected.
2. The database table diagram (ERD), API routes, and screen plan are written down.
3. Automatic checks run on every code save to catch broken code or rule violations.

### Requirement Acceptance Criteria (S1-01)

#### `TA-01` — Web-based application built in three separate layers: User Screens (React), Backend Business Logic (Spring Boot), and Database/Services (Supabase).
- The system is divided into three clear parts: the Website screens (React), the Backend Server (Spring Boot), and the Database/Auth/Storage services (Supabase).
- The website never edits business database tables directly—all business rules go through the Backend Server.

#### `TA-02` — The frontend communicates with the backend server through secure REST API web requests (/api/v1/...).
- The website talks to the backend server through standard, secure web requests (/api/v1/...) carrying the user's sign-in token.
- Errors from the server are returned in a consistent format that the website can display clearly to the user.

#### `NFR-45` — Support large growth in properties, rooms, users, and owners while keeping the system fast and responsive.
- Database tables and lists use indexing and page-by-page loading so the system stays fast as more owners, properties, and rooms are added.
- There is no hard limit on how many properties an owner can add or how many rooms a property can have.

#### `NFR-46` — Easily add new accommodation types (such as student hostels) without rewriting or redesigning core system code.
- Accommodation types (Hotel, Budget Hotel, Guesthouse, Serviced Apartment, Student Hostel) and billing periods (Nightly, Monthly, Term, Academic Year) are stored as table rows so new types can be switched on later without rebuilding the app.
- Sprint 1 enables short-stay types and nightly pricing while keeping future types ready in the database.

#### `NFR-47` — Cloud-based architecture that scales as users, cities and listings grow.
- The website, backend server, database, and photo storage run on cloud services that can scale up without losing user sessions.
- Photos and static files are served through a content delivery network (CDN) for fast loading across Ghana.

#### `NFR-48` — Modular structure accommodating future integrations.
- The backend code is organised into separate, self-contained modules (Identity, Organisation, Verification, Listings, Availability, Notifications, Audit, Admin).
- An automatic check fails the build if one module tries to reach into another module's private tables or code.

#### `NFR-52` — Maintain accurate booking dates and times in Ghana local time (GMT).
- All dates and times are saved consistently in UTC and displayed in Ghana local time (Africa/Accra, GMT+0).
- Calendar blocks and activity log timestamps always match Ghana time.

#### `NFR-54` — Modular, documented architecture enabling easy updates and integration.
- Each module has clear boundaries, clean interfaces, and an automatically generated API guide showing every available route.
- The system design, database diagram, and project rules are kept in the project docs folder.

#### `NFR-55` — Provide technical and operational documentation.
- Clear written guides cover the system architecture, database tables, API endpoints, setup steps, and backup/recovery instructions.
- Any new team member can follow the setup guide to run the project.

#### `NFR-56` — Support automated testing.
- Every requirement in Sprint 1 has an automated test labelled with its requirement ID that runs automatically whenever code is saved.
- If any automated test fails, the broken change is blocked from going live.

#### `NFR-57` — Maintain version-controlled source code.
- All website code, backend code, database migrations, and documentation are tracked in Git with tagged releases.
- Temporary build files and secret keys are excluded from Git.

#### `NFR-58` — Support future maintenance and enhancements without major architectural redesign.
- Sprint 1 sets up clean extension points (shared calendar blocks, listing lookup, billing periods, message templates, activity log, roles, and settings) so Sprint 2 can add bookings and payments without rewriting Sprint 1.
- Every database change only adds new tables or columns—never breaking existing ones.

#### `NFR-63` — Provide REST API-based integration capabilities.
- The website and backend communicate through clean, consistent JSON web addresses (/api/v1/...) with clear error messages.
- An automatic check ensures new updates do not break existing web addresses.

#### `PD-01` — Documented requirements analysis and system design.
- Before feature coding starts, the team has clear written designs for the acceptance criteria, database tables (ERD), server API routes, and screen layouts.
- Every Sprint 1 story links directly to its requirements and design.

#### `PD-02` — Database design and implementation.
- All Sprint 1 database tables, relationships, and overlap rules are created through numbered migration scripts (V1_01 to V1_19).
- The database scripts run cleanly from scratch and are tested automatically.

#### `PD-07` — Module-level, workflow/integration and user-acceptance testing.
- Every story is checked at three levels: automatic unit tests, automatic database/API integration tests, and a real end-to-end walkthrough of the 7-step demo.
- Every requirement ID is linked to an automated test.

---

## S1-02: Live hosting & daily backups

- **Who this helps:** Property owners & administrators (relying on a dependable, backed-up live system)
- **Area:** Cloud & Backups | **Priority:** Must have | **Track:** Track A | **Days:** Day 2 – Day 4
- **Summary:** Put the starter website, backend server, and database online, turn on daily database backups, and practise restoring a backup.
- **Screens involved:** Live cloud URLs for Owner and Admin portals behind Cloudflare security
- **Database tables:** Daily automated Render PostgreSQL backups + Day 4 scratch restore verification
- **System actions:** Cloudflare Workers Static Assets + Render Spring Boot API + Sentry error alerts + uptime monitor
- **Linked Requirements (9):** `PD-06`, `PD-10`, `PD-11`, `PD-12`, `TA-11`, `NFR-27`, `NFR-42`, `NFR-43`, `UR-ON05`

### What Proves This Story Is Finished

1. The website, backend server, and database are live in their cloud homes.
2. Daily automatic database backups are turned on and a test restore is timed.
3. All passwords and secret keys are kept out of the code files, and health alerts are active.

### Requirement Acceptance Criteria (S1-02)

#### `PD-06` — Deployment to cloud infrastructure (frontend via Cloudflare Workers Static Assets/CDN; Spring Boot on Render; database and storage on Supabase).
- The website is hosted on Cloudflare Workers Static Assets, the backend server is hosted on Render, and the database, sign-in, and file storage run on Supabase.
- All three live services are connected over HTTPS and reachable online.

#### `PD-10` — Backend application-health monitoring.
- The backend server provides a live health-check address (/actuator/health) that checks both the server and database connection.
- An uptime monitor checks the health address every few minutes and alerts the team if anything goes wrong.

#### `PD-11` — Daily automated database backups.
- Supabase takes an automatic backup of the database every day.
- During Sprint 1, the team restores a backup into a separate test database and records the time taken to prove recovery works.

#### `PD-12` — Confidential credentials stored in secure environment settings, not source code.
- All live passwords and API keys are stored in Cloudflare, Render, and GitHub secret settings—never in source code.
- Automatic checks verify that no secrets are ever pushed to GitHub.

#### `TA-11` — Secure storage of database passwords and payment-provider secret keys (environment variables).
- All database passwords, encryption keys, and service secrets are stored in secure cloud environment settings—never written in the code files.
- A template file (.env.example) lists the setting names without any real passwords.

#### `NFR-27` — Protect confidential application credentials and secret keys (environment variables, not source code).
- Database passwords, API keys, and encryption keys are stored only in secure server environment settings—never inside the code repository.
- An automatic check scans the code on every save to make sure no secret key is ever committed.

#### `NFR-42` — Provide automatic database backups (daily) and a documented restoration procedure.
- The production database is backed up automatically every day, and a written recovery guide explains how to restore it.
- The team practises restoring a backup into a test database during Sprint 1 and records how long it takes.

#### `NFR-43` — Provide error logging and monitoring.
- Server errors and health problems are logged automatically and reported to the monitoring dashboard so the team can fix issues quickly.
- A health-check address (/actuator/health) lets the uptime monitor verify the server and database are running.

#### `UR-ON05` — Dependable service with backups so records are never lost.
- The database is backed up automatically every day, and the team tests restoring a backup to prove no records will be lost.
- Automatic health checks alert the team if the website or server goes down.

---

## S1-03: Mobile & desktop page layouts

- **Who this helps:** Small property owners, staff, and administrators on mobile phones and desktops
- **Area:** Screen Layouts | **Priority:** Must have | **Track:** Track B | **Days:** Day 2 – Day 5
- **Summary:** Build the shared Owner and Admin page layouts, menus, buttons, and status messages so every screen works cleanly on phones and desktops.
- **Screens involved:** Owner Portal layout, Admin Portal layout, mobile navigation bar/drawer, toast alerts, and empty/loading states
- **Database tables:** None (UI layout and design components)
- **System actions:** Consistent error and status message display across all screens
- **Linked Requirements (11):** `NFR-01`, `NFR-02`, `NFR-03`, `NFR-04`, `NFR-05`, `NFR-07`, `NFR-09`, `NFR-10`, `NFR-12`, `UR-ON01`, `BR-10`

### What Proves This Story Is Finished

1. Owner and Admin pages fit cleanly on small phones (360px), tablets, and desktops.
2. Menus, icons, buttons, and status messages look and behave consistently.
3. Screens work across Chrome, Edge, Firefox, and Safari even on a slow mobile connection.

### Requirement Acceptance Criteria (S1-03)

#### `NFR-01` — Simple, intuitive, user-friendly interface requiring minimal training.
- Screens are clean and uncluttered, guiding owners and admins through each task step by step.
- New pilot owners can register, submit verification documents, and create a listing without needing a manual.

#### `NFR-02` — Clear labels, consistent navigation and understandable instructions.
- Menus, buttons, and form fields use plain, consistent labels across all pages.
- Input fields include helpful examples (such as phone format +233 or prices in GHS) so users know what to enter.

#### `NFR-03` — Visible status messages and feedback for user actions.
- Every button click or form submission shows a clear loading indicator followed by a visible confirmation or error message.
- If a form has an error, the message explains clearly how to fix it right next to the field.

#### `NFR-04` — Accessible form controls.
- All forms, buttons, menus, and popups work with a keyboard (Tab, Enter, Escape) and screen readers.
- Every input field has a properly connected label and clear focus outline.

#### `NFR-05` — Icon-based navigation.
- Main navigation links, property types, amenities, and status badges pair a clear icon with a text label.
- Icons never appear alone without a readable label.

#### `NFR-07` — Interface accommodates users with low literacy or colour-vision difficulties.
- Status badges (Approved, Pending, Needs Correction, Rejected) use icons and text labels—never colour alone—so people with colour-vision differences can read them easily.
- Text and button colours have strong contrast against the background.

#### `NFR-09` — Responsive interface for mobile phones, tablets and desktop devices.
- All Owner and Admin screens adjust smoothly to fit small mobile phones (360px wide), tablets, and desktop screens.
- Buttons and tap targets on mobile are large enough to tap comfortably without mis-clicking.

#### `NFR-10` — Supports modern web browsers (Chrome, Edge, Firefox, Safari).
- The website works properly in current versions of Chrome, Edge, Firefox, and Safari on both phone and desktop.
- Pages open without visual glitches or broken buttons across all four browsers.

#### `NFR-12` — No unnecessary horizontal scrolling on mobile devices.
- On mobile phones (360px width), pages fit the screen width cleanly without sideways scrolling.
- Tables or wide lists either stack neatly into mobile cards or scroll inside their own container.

#### `UR-ON01` — Simple, uncluttered interface suited to small providers.
- Screens use clear headings, everyday language, and step-by-step forms so small property owners can use FindStay without training.
- Key tasks like uploading verification documents, adding a property, or blocking dates take only a few clear steps.

#### `BR-10` — The platform shall provide an accessible solution suitable for small and medium-sized accommodation providers.
- The Owner Portal is lightweight, mobile-friendly, and easy to use on an everyday smartphone over a normal mobile data connection.
- Small guesthouse and apartment owners can manage their listings and calendars without needing a computer.

---

## S1-04: Sign-up, confirmation & sign-in

- **Who this helps:** Guests, Property Owners, Property Staff, and Administrators signing up and signing in
- **Area:** Accounts & Sign-In | **Priority:** Must have | **Track:** Track A | **Days:** Day 2 – Day 5
- **Summary:** Let owners, staff, and admins create an account, confirm their email or phone code, and sign in and out safely.
- **Screens involved:** Sign Up (/auth/register), Confirm Email/OTP (/auth/verify), and Sign In (/auth/login)
- **Database tables:** identity.user_profile, identity.role (seeded with Guest, Owner, Property Staff, Administrator)
- **System actions:** Supabase Auth sign-up/login/logout + Spring Boot JWT verification via JWKS + GET /api/v1/me
- **Linked Requirements (10):** `UR-G01`, `FR-01`, `FR-02`, `FR-03`, `FR-05`, `BRL-01`, `NFR-19`, `NFR-22`, `TA-07`, `TA-08`

### What Proves This Story Is Finished

1. A new user can register, confirm their email or phone code, sign in, and sign out.
2. Private pages block anyone who is not signed in or whose session has expired.
3. Passwords are handled safely by the sign-in service and never stored in FindStay tables.

### Requirement Acceptance Criteria (S1-04)

#### `UR-G01` — Register, log in, log out and manage an account with email/phone, OTP verification and password recovery.
- A new user can create an account with their email and password, confirm their email code/link, and sign in.
- A signed-in user can sign out at any time or reset a forgotten password through their confirmed email.

#### `FR-01` — Allow guests, owners/managers, property staff and administrators to create or receive accounts appropriate to their roles.
- People can create or receive accounts for their role (Guest, Property Owner/Manager, Property Staff, or Administrator).
- A single account can hold role memberships (for example, being a Guest while also managing or working at a property) without needing separate email addresses.

#### `FR-02` — Authenticate users before granting access to protected functions.
- Every private page and action checks that the user is signed in with a valid session before allowing access.
- Anyone who is not signed in is redirected to the sign-in screen.

#### `FR-03` — Support user login and logout.
- A registered user can sign in with their email and password and stay signed in safely while using the app.
- Clicking Sign Out ends the session immediately so the account cannot be used from that browser without signing in again.

#### `FR-05` — Support email or phone verification (OTP).
- New accounts must confirm their email address (or phone code when SMS is enabled) before they are treated as verified.
- Incorrect or expired confirmation codes are rejected with a clear message telling the user how to request a new code.

#### `BRL-01` — Users must authenticate before accessing protected account, booking, financial, messaging, review or administrative functions.
- No one can access account settings, owner tools, verification uploads, listing editors, or admin screens without signing in first.
- All protected routes verify the user's sign-in pass automatically.

#### `NFR-19` — Authenticate users before granting access to protected resources.
- All private screens and server routes require a valid sign-in session before returning any data.
- Unsigned visitors cannot view or change any owner, staff, or admin records.

#### `NFR-22` — Secure password hashing managed by Supabase Auth; FindStay never stores or hashes passwords.
- Passwords are handled and protected entirely by Supabase Auth; FindStay never stores or sees user passwords in its own database tables.
- Even administrators and developers cannot view a user's password.

#### `TA-07` — Password hashing is managed by Supabase Auth; application code never stores or hashes passwords.
- Supabase Auth handles all password storage and security; FindStay's own database and server code never store or see user passwords.
- Sign-up, sign-in, and password resets happen directly through Supabase Auth.

#### `TA-08` — Supabase JWT-based authentication with one-hour access tokens and managed refresh-token rotation; Spring validates JWTs through JWKS.
- When a user signs in, Supabase issues a 1-hour sign-in pass (JWT) that renews automatically while they use the app.
- The backend server verifies every sign-in pass using Supabase's public verification keys and checks that the account is active on sensitive actions.

---

## S1-05: Password reset & user profile

- **Who this helps:** Any signed-in user updating their details or recovering a forgotten password
- **Area:** Accounts & Sign-In | **Priority:** Must have | **Track:** Track A | **Days:** Day 5 – Day 6
- **Summary:** Let users reset a forgotten password through their confirmed email and update their own profile details.
- **Screens involved:** Forgot Password (/auth/forgot-password), Reset Password (/auth/reset-password), and My Profile (/profile)
- **Database tables:** identity.user_profile (name, phone, avatar_url, preferred_language)
- **System actions:** Supabase password reset flow + GET /api/v1/me and PATCH /api/v1/me
- **Linked Requirements (2):** `FR-04`, `FR-06`

### What Proves This Story Is Finished

1. A user can reset a forgotten password through a single-use link sent to their email.
2. A signed-in user can view and edit only their own profile details.
3. Expired or already-used password reset links are rejected.

### Requirement Acceptance Criteria (S1-05)

#### `FR-04` — Provide password reset and account recovery through a verified contact channel.
- A user who forgets their password can request a password reset link sent to their confirmed email address.
- The reset link expires after a short time and can only be used once to set a new password.

#### `FR-06` — Allow users to view and update authorised profile information.
- A signed-in user can view and update their own name, phone number, profile photo, and language preference.
- A user cannot edit another person's profile or change their own approval status.

---

## S1-06: Role permissions & safe access

- **Who this helps:** All users (protecting private owner records and admin-only controls)
- **Area:** Security & Roles | **Priority:** Must have | **Track:** Track A | **Days:** Day 4 – Day 6
- **Summary:** Make sure every screen and server action checks the signed-in person’s role so admin and owner tools stay protected.
- **Screens involved:** Access-denied states and role-aware menus in Owner and Admin portals
- **Database tables:** identity.role, identity.permission, identity.role_permission
- **System actions:** @RequiresPermission security guard on every API route + input validation + HTTPS enforcement
- **Linked Requirements (7):** `FR-07`, `BRL-02`, `NFR-20`, `NFR-21`, `NFR-23`, `NFR-24`, `UR-AN01`

### What Proves This Story Is Finished

1. Every protected page and server action checks the user’s role and permissions.
2. Administrator screens and actions are completely blocked for non-admin users.
3. All form inputs are checked to block unsafe text or attempts to view other people’s records.

### Requirement Acceptance Criteria (S1-06)

#### `FR-07` — Enforce role-based access control (RBAC) and prevent access to unauthorised data or functions.
- Every screen and server action checks the user's role and permissions before showing data or saving changes.
- Users who do not have permission for an action receive a clear 'Access denied' message.

#### `BRL-02` — Each account shall have one primary role.
- Each user account has a primary profile and clear role memberships (Guest, Owner/Manager, Property Staff, or Administrator) per settled decision P-04.
- The system always knows which role and company permissions apply to the signed-in user.

#### `NFR-20` — Enforce role-based authorisation (RBAC).
- The server checks the signed-in user's role and permissions on every single request, not just in the browser UI.
- A user cannot bypass screen buttons by calling server URLs directly.

#### `NFR-21` — Protect sensitive information during transmission (HTTPS/TLS) and storage (encryption at rest).
- All traffic between the browser, server, and database is encrypted using HTTPS/TLS, and sensitive ID numbers are encrypted before being saved in the database.
- Private identity numbers are never shown in plain text in logs or public responses.

#### `NFR-23` — Validate user input; protect against SQL injection and cross-site scripting (XSS).
- All user inputs are checked for valid format and length on both the form and the server, blocking harmful code or database injection attempts.
- Special characters in titles, descriptions, or reasons are displayed safely without breaking the page.

#### `NFR-24` — Prevent unauthorised direct access to protected records.
- When someone requests a property, unit, document, or verification case by its ID, the server verifies they own it or are authorised to review it.
- Private verification documents use temporary signed links that expire automatically after a short time.

#### `UR-AN01` — Strong security and administrator-only access.
- Only signed-in administrators can open admin pages or run admin actions.
- Guests, property owners, and property staff are automatically blocked if they try to open any admin link.

---

## S1-07: Owner companies & staff access

- **Who this helps:** Property owners managing a business and inviting staff for specific properties
- **Area:** Organisations & Staff | **Priority:** Must have | **Track:** Track A | **Days:** Day 4 – Day 7
- **Summary:** Give each property owner their own company space, let them invite staff for specific properties, and keep every owner’s data separate.
- **Screens involved:** Company & Staff Management (/owner/staff) and Staff Invite Acceptance (/owner/invitations)
- **Database tables:** organization.organization, organization.membership, organization.membership_permission
- **System actions:** POST /api/v1/owner/staff/invite, PUT /api/v1/owner/staff/:id/permissions + automatic OrgScope data isolation
- **Linked Requirements (8):** `UR-O15`, `UR-PS01`, `UR-PSN01`, `UR-PM03`, `FR-09`, `BRL-04`, `BRL-05`, `UR-ON02`

### What Proves This Story Is Finished

1. Each owner automatically gets their own company space during onboarding.
2. An owner can invite staff and grant or remove permissions for specific properties.
3. One owner can never see or edit another owner’s company, properties, or staff.

### Requirement Acceptance Criteria (S1-07)

#### `UR-O15` — Grant and manage access permissions for property staff.
- An owner can invite staff members to their organisation and choose which properties and actions each staff member is allowed to manage.
- An owner can remove a staff member's access to a property at any time, and the change takes effect immediately.

#### `UR-PS01` — Access only properties and functions explicitly authorised by an owner/manager or administrator.
- A property staff member only sees the specific properties and tools that the owner has given them permission to use.
- If a staff member tries to open or edit another property in the same company without permission, the system blocks the request.

#### `UR-PSN01` — Restricted, role-limited access to protect sensitive data.
- Property staff cannot view sensitive owner identity documents (like Ghana Card numbers) or change company-wide staff roles.
- Each staff account is restricted to only the tasks required for their job.

#### `UR-PM03` — Assign access permissions to authorised staff.
- An owner or manager can assign specific permissions (such as viewing a listing, editing details, or managing the calendar) to each staff member.
- Every permission grant or removal is saved and logged.

#### `FR-09` — Support property-staff permissions explicitly granted by authorised owners/managers or administrators.
- Owners and administrators can grant or remove specific property permissions for staff members.
- Permission changes take effect right away without requiring the staff member to create a new account.

#### `BRL-04` — Additional property-staff access must be explicitly granted by an authorised owner/manager or administrator.
- A staff member gets access to a property only when an authorised owner, manager, or administrator explicitly invites them and grants permission.
- No one can grant themselves staff access to a property.

#### `BRL-05` — Owners/managers and staff may access only properties and financial records they are authorised for.
- Owners, managers, and staff can view and change only the properties and records they have been given permission to access.
- The system blocks any attempt to view or change another company's properties.

#### `UR-ON02` — Access limited to own properties and financial records.
- Each property owner and their staff can see and manage only their own organisation's properties, units, documents, and records.
- One owner can never view or edit another owner's properties or documents.

---

## S1-08: Permanent activity log

- **Who this helps:** Administrators auditing platform activity and investigating disputes or changes
- **Area:** Activity Log | **Priority:** Should have | **Track:** Track A | **Days:** Day 5 – Day 7
- **Summary:** Record a permanent history of important admin, verification, and account actions that no one can edit or delete.
- **Screens involved:** Admin Activity Log viewer (/admin/audit) with user, action, and date filters
- **Database tables:** audit.audit_log (append-only table—UPDATE and DELETE blocked at database level)
- **System actions:** Shared AuditRecorder service + GET /api/v1/admin/audit-logs
- **Linked Requirements (5):** `UR-A07`, `UR-AN02`, `NFR-66`, `BR-11`, `BRL-19`

### What Proves This Story Is Finished

1. Important admin, verification, and account actions record who did what and when.
2. Activity log entries are permanent and cannot be edited or deleted by anyone.
3. Administrators can search and filter the activity log by user, action, or date.

### Requirement Acceptance Criteria (S1-08)

#### `UR-A07` — Inspect and maintain audit logs of significant actions.
- An administrator can view and filter the activity log by person, action type, record, or date.
- Activity log entries are permanent and cannot be edited or deleted by anyone.

#### `UR-AN02` — Tamper-proof, auditable logs of significant actions.
- Every important action (approvals, rejections, role changes, suspensions, setting updates) automatically creates a permanent log entry.
- The database blocks any attempt to alter or erase past log entries.

#### `NFR-66` — Audit records shall identify the action, user and date/time.
- Every activity log entry records who performed the action, what action was taken, which record was affected, and the exact date and time.
- Log entries missing any of these details are rejected by the database.

#### `BR-11` — The platform shall support accountability through verification, audit records and administrative controls.
- Every listing must pass owner verification and administrator approval before going live, and every decision is permanently logged.
- Administrators can suspend any listing or account that violates platform standards, with a recorded reason.

#### `BRL-19` — Suspension and restoration decisions must be recorded in audit logs.
- Whenever an administrator suspends or restores a user account or property listing, they must enter a reason, and the decision is saved in the permanent activity log.
- Both the suspension and restoration history remain visible in the audit log.

---

## S1-09: Photo & document uploads

- **Who this helps:** Property owners uploading listing photos and private verification documents
- **Area:** Photos & Files | **Priority:** Must have | **Track:** Track B | **Days:** Day 4 – Day 6
- **Summary:** Let owners upload property photos (compressed to fast-loading WebP) while keeping identity and ownership documents private.
- **Screens involved:** Photo Uploader component and Document Uploader component in the Owner Portal
- **Database tables:** media.media_asset, media.document (linking files to properties or verification cases)
- **System actions:** POST /api/v1/media/upload-url, WebP image optimisation, and temporary signed URLs for private files
- **Linked Requirements (3):** `TA-12`, `TA-13`, `NFR-17`

### What Proves This Story Is Finished

1. Property photos are compressed into fast-loading WebP images for public viewing.
2. Owner ID cards and property documents stay locked in a private folder.
3. Oversized or invalid files are rejected, and private documents use temporary expiring links.

### Requirement Acceptance Criteria (S1-09)

#### `TA-12` — Property photographs stored using Cloudflare R2.
- Property photos are stored in a public photo bucket on Cloudflare R2 (`findstay-property-images`), while private verification documents are stored in a locked private bucket (`findstay-verification-docs`).
- Each user can upload only to their own authorised folder.

#### `TA-13` — Images compressed, optimised and served in modern lightweight formats (WebP).
- Property photos are compressed and converted into fast-loading WebP images so pages load quickly on mobile networks.
- Images are delivered with caching headers so repeat visits load instantly.

#### `NFR-17` — Property photographs optimised to reduce loading time and mobile data consumption (WebP format).
- Uploaded listing photos are automatically compressed and converted into lightweight WebP images so pages load fast and use less mobile data.
- Oversized files (over 5 MB) or non-image files are blocked before upload with a friendly message.

---

## S1-10: Email, SMS & in-app alerts

- **Who this helps:** Owners, staff, and users receiving updates about their account, verification, or listings
- **Area:** Notifications | **Priority:** Must have | **Track:** Track A | **Days:** Day 5 – Day 7
- **Summary:** Send automatic email, SMS, and in-app notifications when an account, verification case, or listing status changes.
- **Screens involved:** In-app Notification Bell & Inbox (/notifications) + formatted Email and SMS messages
- **Database tables:** notification.notification, notification.notification_template, notification.notification_delivery
- **System actions:** NotificationSender service + Email & Ghana SMS adapters + GET /api/v1/notifications
- **Linked Requirements (5):** `FR-68`, `FR-69`, `FR-70`, `FR-71`, `NFR-60`

### What Proves This Story Is Finished

1. Account, verification, and listing updates notify the user by email, SMS, and in-app alert.
2. If a message fails to send, the failure is logged and retried automatically.
3. Email and SMS providers can be swapped in settings without changing feature code.

### Requirement Acceptance Criteria (S1-10)

#### `FR-68` — Notify relevant users about verification-status changes.
- Whenever an owner's verification status or listing approval status changes, the owner is notified automatically with the decision and any reviewer notes.
- The notification appears both in the app and by email (and SMS when enabled).

#### `FR-69` — Provide email notifications.
- Important account, verification, and listing updates are sent to the user's confirmed email address using clear, readable templates.
- If an email fails to send, the system records the failure and retries automatically.

#### `FR-70` — Support SMS notifications.
- The notification system supports sending SMS alerts to Ghana phone numbers (+233) through a local SMS provider.
- If SMS is switched off during initial testing, the system falls back to email notifications without interrupting the user.

#### `FR-71` — Notify users about relevant account activities.
- Users receive notifications for important account events such as staff invitations, permission updates, and account status changes.
- Users can see their recent notifications inside the portal and mark them as read.

#### `NFR-60` — Communication-service integrations: email and SMS providers.
- Email and SMS services are connected through clean plug-in adapters so the team can switch providers by changing settings rather than rewriting features.
- Message delivery is tested automatically using safe test adapters.

---

## S1-11: Privacy notice & user consent

- **Who this helps:** All users (protecting personal data under Ghana’s Data Protection Act, 2012 — Act 843)
- **Area:** Privacy & Consent | **Priority:** Should have | **Track:** Track A | **Days:** Day 6 – Day 7
- **Summary:** Show a clear Ghana Act 843 privacy notice at sign-up, record user consent, and ask only for needed personal information.
- **Screens involved:** Privacy Notice modal/page and mandatory Act 843 consent checkbox on Sign Up & Onboarding
- **Database tables:** identity.consent_record (user_id, policy_version, consented_at, ip_address)
- **System actions:** POST /api/v1/me/consents + strict field filtering so private data is never exposed publicly
- **Linked Requirements (4):** `NFR-31`, `NFR-32`, `NFR-35`, `NFR-36`

### What Proves This Story Is Finished

1. Users see a clear Ghana Act 843 privacy notice and give consent when signing up.
2. Forms ask only for personal details that are genuinely needed.
3. Personal and verification details are visible only to the owner and authorised reviewers.

### Requirement Acceptance Criteria (S1-11)

#### `NFR-31` — Protect users' personal and financial information.
- Personal contact details and verification records are kept private and never exposed on public listing responses.
- The server returns only the fields needed for each screen.

#### `NFR-32` — Comply with Ghana's Data Protection Act, 2012 (Act 843).
- Sign-up and owner verification screens show a clear privacy notice referencing the Data Protection Commission (DPC) under Ghana's Data Protection Act, 2012 (Act 843).
- The system records when each user agreed to the privacy notice and which version they accepted.

#### `NFR-35` — Restrict personal and financial information to authorised users only.
- Only the property owner and authorised administrators can view an owner's verification documents and personal details.
- Other owners, guests, and unauthorised staff are blocked from viewing those records.

#### `NFR-36` — Collect only necessary personal information; obtain user consent for data collection.
- Forms ask only for personal details that are genuinely needed to run the account and verify properties.
- A user must tick the data-protection consent box before their registration is accepted.

---

## S1-12: Owner ID & property verification

- **Who this helps:** Property owners proving their identity and property ownership before listing
- **Area:** Owner Verification | **Priority:** Must have | **Track:** Track B | **Days:** Day 6 – Day 8
- **Summary:** Let owners submit their Ghana Card, ownership proof, and tourism licence for review, with ID numbers encrypted in the database.
- **Screens involved:** Owner Verification Wizard (/owner/verification) and Verification Status Tracker
- **Database tables:** verification.verification_case (with AES-256 encrypted Ghana Card number), verification.verification_document
- **System actions:** POST /api/v1/owner/verification-cases, POST /api/v1/owner/verification-cases/:id/resubmit, GET /api/v1/owner/verification-cases/mine
- **Linked Requirements (5):** `UR-O01`, `FR-08`, `NFR-28`, `NFR-34`, `TA-09`

### What Proves This Story Is Finished

1. An owner can upload their Ghana Card, ownership proof, and tourism licence and track review status.
2. Ghana Card numbers are encrypted before being saved in the database.
3. If an admin asks for corrections, the owner can upload updated files and resubmit.

### Requirement Acceptance Criteria (S1-12)

#### `UR-O01` — Register, complete onboarding and submit identity and property documents for verification; track approval status.
- A property owner can complete onboarding by uploading their Ghana Card, proof of property ownership/authorisation, and Ghana Tourism Authority (GTA) licence.
- The owner can check their verification status at any time (Pending Review, Needs Correction, Approved, or Rejected) and see reviewer notes.

#### `FR-08` — Allow owners/managers to submit identity and property-verification information for review.
- A property owner can submit their Ghana Card details, proof of property ownership/authorisation, and Ghana Tourism Authority licence for admin review.
- If an administrator asks for corrections, the owner can upload updated documents and send the application back for review.

#### `NFR-28` — Protect sensitive identity information including Ghana Card details.
- Ghana Card numbers submitted during owner verification are encrypted with AES-256 before being stored in the database.
- Normal screens show only a masked version of the Ghana Card number (such as GHA-*******-X).

#### `NFR-34` — Follow relevant tourism business verification and regulatory requirements.
- Owner verification collects and checks the required regulatory documents: Ghana Card, proof of property ownership/authorisation, and Ghana Tourism Authority (GTA) licence where applicable.
- Administrators can inspect each uploaded document before approving an owner.

#### `TA-09` — Encryption of sensitive identification information at rest.
- Sensitive identity numbers (such as Ghana Card numbers) are encrypted before they are saved in the database.
- Even if someone looks at the raw database table, the identity number is unreadable ciphertext.

---

## S1-13: Create properties, rooms & prices

- **Who this helps:** Verified property owners creating and managing hotels, guesthouses, and apartments in Takoradi
- **Area:** Property Listings | **Priority:** Must have | **Track:** Track B | **Days:** Day 4 – Day 8
- **Summary:** Let verified owners create, edit, and pause property listings with individual rooms, photos, nightly GHS prices, amenities, and house rules.
- **Screens involved:** Owner Listings List (/owner/listings), Property & Units Editor (/owner/listings/:id/edit), and Listing Preview
- **Database tables:** catalog.property, catalog.unit, catalog.listing, catalog.rate_plan (in integer pesewas), catalog.amenity, catalog.area (Takoradi areas)
- **System actions:** CRUD /api/v1/owner/properties & /listings, POST /api/v1/owner/listings/:id/submit,POST /pause, and public CatalogQuery seam
- **Linked Requirements (11):** `FR-11`, `FR-12`, `FR-13`, `FR-14`, `FR-15`, `FR-16`, `FR-17`, `FR-22`, `BRL-06`, `BR-03`, `BR-02`

### What Proves This Story Is Finished

1. A verified owner can create, edit, and pause a property with rooms, photos, GHS prices, amenities, and rules.
2. A listing missing required details (such as photos, price, or room capacity) cannot be sent for approval.
3. Only verified owners can create or submit listings.

### Requirement Acceptance Criteria (S1-13)

#### `FR-11` — Allow verified owners/managers to create property listings.
- A verified property owner can create a new property listing in draft mode and fill in its details step by step.
- An owner whose verification has not yet been approved is prompted to complete verification before creating or submitting a listing.

#### `FR-12` — Allow owners/managers to update existing property listings.
- An owner or authorised staff member can update an existing listing's title, description, location, rooms/units, photos, prices, amenities, and house rules.
- Saved updates are validated so required information cannot be accidentally erased.

#### `FR-13` — Allow owners/managers to deactivate or pause property listings.
- An owner can pause or deactivate a published listing whenever they want to stop showing it to guests.
- A paused listing is hidden from public search until the owner resumes it.

#### `FR-14` — Allow owners/managers to upload property photographs and listing images.
- An owner can upload photos for their property and rooms, reorder them, and choose a cover photo.
- Only valid image files within the size limit are accepted, and uploaded photos are optimised for fast loading.

#### `FR-15` — Allow owners/managers to manage property descriptions, accommodation types, unit categories, capacity and quantities.
- An owner can set the property's accommodation type (Hotel, Budget Hotel, Guesthouse, or Serviced Apartment) and add individual bookable units/rooms with guest capacity, bedrooms, and bathrooms.
- Each unit is tracked individually so its calendar cannot be double-booked, and similar units can be grouped by category for display.

#### `FR-16` — Allow owners/managers to manage property amenities, facilities and house rules.
- An owner can select available amenities (such as Wi-Fi, Air Conditioning, Backup Generator, Water Tank, Parking, Security) and write clear house rules (check-in/out times, smoking, pets).
- Selected amenities and house rules are saved with the listing and shown on the listing preview.

#### `FR-17` — Allow owners/managers to manage accommodation prices and rates.
- An owner can set the nightly price in Ghana Cedis (GHS) for each unit or room category.
- Prices are saved accurately in integer pesewas so there are never rounding errors.

#### `FR-22` — Validate required information before a listing is saved or published.
- Before a listing can be submitted for approval, the system checks that all required details are complete: title, description, Takoradi area, accommodation type, at least 1 unit with capacity, nightly price, at least 3 photos, amenities, and house rules.
- If anything is missing, the system highlights the exact missing items so the owner can fill them in.

#### `BRL-06` — Listings must contain the minimum required information before submission for approval.
- A listing cannot be submitted for admin approval until all required details (title, description, Takoradi area, accommodation type, at least 1 unit, nightly price, at least 3 photos, amenities, and house rules) are filled in.
- Incomplete listings stay saved as drafts until completed.

#### `BR-03` — The platform shall support hotels, budget hotels, guesthouses, student hostels and serviced/short-stay apartments.
- The system supports Hotels, Budget Hotels, Guesthouses, Serviced Apartments, and Student Hostels.
- In Sprint 1, owners can list Hotels, Budget Hotels, Guesthouses, and Serviced Apartments, while Student Hostels are prepared in the database for Phase 2.

#### `BR-02` — The platform shall initially focus on Takoradi as its proposed local pilot context.
- The location list is pre-loaded with Takoradi neighbourhoods and landmarks (such as Beach Road, Anaji, Airport Ridge, Chapel Hill, Effia-Kuma, Fijai, Tanokrom, Apollo, Market Circle, and TTU Campus).
- Owners creating a listing in Release R1 can easily pick their Takoradi area and nearby landmark.

---

## S1-14: Room availability calendar

- **Who this helps:** Owners and property staff managing when each room or unit is available
- **Area:** Availability Calendar | **Priority:** Must have | **Track:** Track B | **Days:** Day 7 – Day 8
- **Summary:** Let owners and authorised staff block or unblock dates on each room’s calendar, while preventing overlapping blocks.
- **Screens involved:** Unit Availability Calendar (/owner/listings/:id/calendar) with date-range block/unblock controls
- **Database tables:** availability.availability_block (with PostgreSQL btree_gist overlap exclusion constraint per unit_id)
- **System actions:** GET /api/v1/owner/units/:unitId/calendar, POST /api/v1/owner/units/:unitId/blocks, DELETE /api/v1/owner/units/:unitId/blocks/:blockId
- **Linked Requirements (4):** `UR-O02`, `UR-O03`, `FR-18`, `FR-39`

### What Proves This Story Is Finished

1. An owner or authorised staff member can block or unblock dates on each room’s calendar.
2. The database blocks any attempt to save two overlapping unavailable ranges on the same room.
3. If two people try to block the same dates at the same moment, only the first one succeeds.

### Requirement Acceptance Criteria (S1-14)

#### `UR-O02` — Create, edit, deactivate and manage property listings including photos, descriptions, units, prices, amenities, house rules and availability.
- Once verified, an owner can create, edit, pause, and manage property listings—including rooms/units, photos, nightly prices in GHS, amenities, house rules, and available dates.
- Owners who have not yet been verified cannot submit or publish a listing.

#### `UR-O03` — Manage property and unit availability calendars.
- An owner or authorised staff member can view a calendar for each room/unit and block or unblock dates when the unit is unavailable.
- The system prevents two unavailable blocks from overlapping on the same unit for the same dates.

#### `FR-18` — Allow owners/managers to manage property and unit availability.
- An owner or authorised staff member can mark specific date ranges as unavailable on any unit's calendar and remove those blocks when dates open up.
- End dates must be after start dates, and changes appear on the unit calendar right away.

#### `FR-39` — Provide a real-time availability calendar.
- Each unit has a real-time availability calendar showing which dates are open and which dates are blocked.
- If two people try to block overlapping dates for the same unit at the same time, the database saves the first one and blocks the duplicate.

---

## S1-15: Admin review & listing approval

- **Who this helps:** Administrators reviewing owner verifications and property listings before they go live
- **Area:** Admin Approvals | **Priority:** Must have | **Track:** Track B | **Days:** Day 7 – Day 8
- **Summary:** Let administrators review submitted listings and approve, reject, suspend, restore, or request corrections with a written reason.
- **Screens involved:** Admin Verification & Listing Approval Queue (/admin/approvals) and Detailed Review Drawer/Screen
- **Database tables:** catalog.listing_status_history, verification.review_decision
- **System actions:** POST /api/v1/admin/listings/:id/{approve|reject|request-corrections|suspend|restore} with mandatory reason & audit log
- **Linked Requirements (3):** `UR-A02`, `FR-21`, `FR-88`

### What Proves This Story Is Finished

1. An administrator can approve, reject, suspend, restore, or ask for corrections on submitted listings.
2. A listing goes live (Published) only after an administrator approves it.
3. Every decision requires a written reason, logs the history, and notifies the owner.

### Requirement Acceptance Criteria (S1-15)

#### `UR-A02` — Review, approve, reject, suspend, restore or request corrections to property listings.
- An administrator can open any submitted listing in the approval queue and choose Approve, Reject, Request Corrections, Suspend, or Restore.
- Rejecting, suspending, or asking for corrections requires the administrator to write a clear reason for the property owner.
- The property owner receives an automatic notification whenever their listing status changes.

#### `FR-21` — Publish a listing only after it meets verification and approval requirements set by administrators.
- A listing goes live (Published) only after both the owner's verification is Approved and an administrator approves the submitted listing.
- An owner cannot publish their own listing directly without administrator approval.

#### `FR-88` — Allow administrators to manage property submissions: approve, reject, suspend, restore or request corrections.
- Administrators can review submitted listings and Approve, Reject, Request Corrections, Suspend, or Restore them.
- Every listing decision saves a status history record, logs the administrator's reason, and notifies the property owner.

---

## S1-16: Admin dashboard, users & settings

- **Who this helps:** Administrators monitoring platform activity, managing user accounts, and toggling settings
- **Area:** Admin Controls | **Priority:** Should have | **Track:** Track B | **Days:** Day 6 – Day 8
- **Summary:** Give administrators a summary dashboard, tools to create, suspend, or restore user accounts, and a page to update platform settings.
- **Screens involved:** Admin Dashboard (/admin), User Management (/admin/users), and Platform Settings (/admin/settings)
- **Database tables:** admin.platform_setting (key-value settings and feature flags)
- **System actions:** GET /api/v1/admin/dashboard, POST /api/v1/admin/users/:id/{suspend|restore}, GET/PUT /api/v1/admin/settings
- **Linked Requirements (5):** `UR-A01`, `FR-87`, `UR-A08`, `FR-92`, `FR-86`

### What Proves This Story Is Finished

1. An administrator sees a summary dashboard of pending verifications, listings, and users.
2. An administrator can create, suspend, or restore user accounts and update platform settings.
3. Suspended users are blocked immediately, and all admin changes are recorded in the activity log.

### Requirement Acceptance Criteria (S1-16)

#### `UR-A01` — Manage user accounts (create, suspend, restore).
- An administrator can create a new user account, suspend an active account, or restore a suspended account from the Admin Users screen.
- A suspended user is immediately blocked from signing in or using protected pages until restored.
- Every account creation, suspension, or restoration is saved in the activity log with the admin's name, reason, and time.

#### `FR-87` — Allow administrators to manage users and accounts.
- Administrators can search user accounts, create new accounts, suspend accounts that break rules, and restore suspended accounts.
- Every user management action requires a reason and is recorded in the activity log.

#### `UR-A08` — Manage platform settings.
- An administrator can view and update platform-wide settings and feature switches from the Admin Settings screen.
- Every change to a setting records the old value, the new value, who changed it, and when.

#### `FR-92` — Allow administrators to manage platform settings.
- Administrators can view and update platform settings and feature on/off switches from a settings screen without needing code changes.
- Only administrators can view internal switches or save setting changes.

#### `FR-86` — Provide a dedicated administrative dashboard.
- Administrators have a dedicated dashboard showing counts of pending owner verifications, listings waiting for approval, published listings, and recent activity.
- Clicking any summary card takes the administrator straight to that queue.

---

## S1-17: Final testing & Release R1

- **Who this helps:** Pilot property owners, administrators, and the Product Owner reviewing Release R1
- **Area:** Release R1 | **Priority:** Must have | **Track:** Track A | **Days:** Day 9 – Day 10
- **Summary:** Run full checks with two pilot property owners, test a backup recovery, put Release R1 live, and demo the finished sprint.
- **Screens involved:** All Release R1 screens tested end to end across the 7-step Sprint Review demo script
- **Database tables:** Full V1_01–V1_19 schema verified on staging and production + backup restore check
- **System actions:** All Sprint 1 endpoints verified by the R1 automated regression suite
- **Linked Requirements (0):** Release check

### What Proves This Story Is Finished

1. Two pilot property owners complete the full sign-up-to-published-listing journey.
2. The team proves one owner cannot see another’s data and completes a backup restore drill.
3. Release R1 is live and accepted by the Product Owner at Sprint Review.

---

