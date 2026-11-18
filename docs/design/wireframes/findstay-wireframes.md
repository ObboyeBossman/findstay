# FindStay — Sprint 1 Wireframes Specification (`S1-01-T4`)

> **Task Reference:** `S1-01-T4` (Sprint 1 UI/UX Wireframes)  
> **Author / Assignee:** Emmanuel Rockson (@surnuel)  
> **Source Specification:** `SCR-*` inventory in [`docs/design/user-flows.md`](../user-flows.md) (`S1-01-T3`)  
> **Interactive HTML Mockup:** [`findstay-wireframes.html`](./findstay-wireframes.html)  
> **PDF Export:** [`findstay-wireframes.pdf`](./findstay-wireframes.pdf)

---

## 1. Overview & System Conventions

- **Viewport Strategy:** Grey low-fidelity layouts built mobile-first (`360px` base phone viewport) with desktop counterpart (`≥1024px`).
- **Responsive Portal Shells:** Owner and Admin persistent navigation shells, drawers, and feedback states follow [`docs/design/portal-shell-wireframes.md`](../portal-shell-wireframes.md).
- **Accessible Indicators (NFR-07):** Status is never communicated by colour alone. Every state indicator uses an explicit icon together with text (e.g., `Approved ✓`, `Rejected ✗`, `Pending ⏳`).
- **Currency & Localization:** Prices display in Ghana Cedis (`GH₵`) and are stored as integer pesewas. Times display in Ghana Standard Time (`Africa/Accra`) and are persisted in UTC.
- **Media Placeholders:** Dashed boxes in wireframes signify image/media containers.
- **Out of Sprint 1 Scope:** `SCR-25A` (Recently Viewed), `SCR-26` (Booking Details), `SCR-27` (Confirm Booking), `SCR-28` (Booking Confirmation). Standard empty, error, loading, and success states follow the shared Screen-State Matrix in the UI kit.

---

## 2. Screen Inventory & Quick Navigation

| Screen ID | Name | Role / Portal | Layout Type | Image Export |
| :--- | :--- | :--- | :--- | :--- |
| **SCR-01** | [Sign In](#scr-01--sign-in) | Auth | Centered Card | [`SCR-01-Sign-In.png`](./SCR-01-Sign-In.png) |
| **SCR-02** | [Create Account](#scr-02--create-account) | Auth | Centered Card | [`SCR-02-Create-Account.png`](./SCR-02-Create-Account.png) |
| **SCR-03A** | [Account Verification (OTP)](#scr-03a--account-verification-otp) | Auth | Centered Card | [`SCR-03A-Account-Verification-OTP.png`](./SCR-03A-Account-Verification-OTP.png) |
| **SCR-03B** | [Email Link Landing](#scr-03b--email-link-landing) | Auth | Centered Card | [`SCR-03B-Email-Link-Landing.png`](./SCR-03B-Email-Link-Landing.png) |
| **SCR-04** | [Forgot Password](#scr-04--forgot-password) | Auth | Centered Card | [`SCR-04-Forgot-Password.png`](./SCR-04-Forgot-Password.png) |
| **SCR-05** | [Reset Password](#scr-05--reset-password) | Auth | Centered Card | [`SCR-05-Reset-Password.png`](./SCR-05-Reset-Password.png) |
| **SCR-06** | [Profile & Notification Preferences](#scr-06--profile--notification-preferences) | Shared / Account | Portal Layout | [`SCR-06-Profile-Notification-Preferences.png`](./SCR-06-Profile-Notification-Preferences.png) |
| **SCR-06B** | [Role / Portal Picker](#scr-06b--role--portal-picker) | Multi-role Auth | Centered Card | [`SCR-06B-Role-Portal-Picker.png`](./SCR-06B-Role-Portal-Picker.png) |
| **SCR-06C** | [Policy Re-Consent Gate](#scr-06c--policy-re-consent-gate) | Auth / Legal | Centered Card | [`SCR-06C-Policy-Re-Consent-Gate.png`](./SCR-06C-Policy-Re-Consent-Gate.png) |
| **SCR-06D** | [Session Expired](#scr-06d--session-expired) | Global Error | Centered Card | [`SCR-06D-Session-Expired-Redirect.png`](./SCR-06D-Session-Expired-Redirect.png) |
| **SCR-07** | [Owner Dashboard](#scr-07--owner-dashboard) | Owner | Owner Portal | [`SCR-07-Owner-Dashboard.png`](./SCR-07-Owner-Dashboard.png) |
| **SCR-07B** | [Owner Listings List](#scr-07b--owner-listings-list) | Owner | Owner Portal | [`SCR-07B-Owner-Listings-List.png`](./SCR-07B-Owner-Listings-List.png) |
| **SCR-08** | [Organisation & Staff Setup](#scr-08--organisation--staff-setup) | Owner | Owner Portal | [`SCR-08-Organisation-Staff-Setup.png`](./SCR-08-Organisation-Staff-Setup.png) |
| **SCR-08B** | [Staff Invitation Acceptance](#scr-08b--staff-invitation-acceptance) | Staff Onboarding | Centered Card | [`SCR-08B-Staff-Invitation-Acceptance.png`](./SCR-08B-Staff-Invitation-Acceptance.png) |
| **SCR-09** | [Owner Verification Upload](#scr-09--owner-verification-upload) | Owner | Owner Portal | [`SCR-09-10-Owner-Verification-Status.png`](./SCR-09-10-Owner-Verification-Status.png) |
| **SCR-10** | [Owner Verification Status](#scr-10--owner-verification-status) | Owner | Owner Portal | [`SCR-09-10-Owner-Verification-Status.png`](./SCR-09-10-Owner-Verification-Status.png) |
| **SCR-11** | [Add / Edit Property Form](#scr-11--add--edit-property-form) | Owner | Owner Portal | [`SCR-11-Add-Edit-Property-Multi-Unit-Form.png`](./SCR-11-Add-Edit-Property-Multi-Unit-Form.png) |
| **SCR-11B** | [Multi-Unit Editor](#scr-11b--multi-unit-editor) | Owner | Owner Portal | [`SCR-11-Add-Edit-Property-Multi-Unit-Form.png`](./SCR-11-Add-Edit-Property-Multi-Unit-Form.png) |
| **SCR-11C** | [Listing Preview](#scr-11c--listing-preview) | Owner | Owner Portal | [`SCR-11C-Listing-Preview.png`](./SCR-11C-Listing-Preview.png) |
| **SCR-12** | [Photo Management](#scr-12--photo-management) | Owner | Owner Portal | [`SCR-12-Photo-Management.png`](./SCR-12-Photo-Management.png) |
| **SCR-13** | [Property Submission Status](#scr-13--property-submission-status) | Owner | Owner Portal | [`SCR-13-Property-Submission-Status.png`](./SCR-13-Property-Submission-Status.png) |
| **SCR-14** | [Manage Property & Units](#scr-14--manage-property--units) | Owner | Owner Portal | [`SCR-14-Manage-Property-Units.png`](./SCR-14-Manage-Property-Units.png) |
| **SCR-15** | [Unit Availability Calendar](#scr-15--unit-availability-calendar) | Owner | Owner Portal | [`SCR-15-Unit-Availability-Calendar.png`](./SCR-15-Unit-Availability-Calendar.png) |
| **SCR-16** | [Block / Unblock Dates](#scr-16--block--unblock-dates) | Owner | Owner Portal | [`SCR-16-Block-Unblock-Dates-Form.png`](./SCR-16-Block-Unblock-Dates-Form.png) |
| **SCR-17** | [Admin Sign In](#scr-17--admin-sign-in) | Admin Auth | Centered Card | [`SCR-17-Admin-Sign-In.png`](./SCR-17-Admin-Sign-In.png) |
| **SCR-18** | [Admin Dashboard](#scr-18--admin-dashboard) | Admin | Admin Portal | [`SCR-18-Admin-Dashboard.png`](./SCR-18-Admin-Dashboard.png) |
| **SCR-19** | [Submitted Review Queue](#scr-19--submitted-review-queue) | Admin | Admin Portal | [`SCR-19-Submitted-Review-Queue.png`](./SCR-19-Submitted-Review-Queue.png) |
| **SCR-20** | [Property & Verification Review](#scr-20--property--verification-review) | Admin | Admin Portal | [`SCR-20-Property-Verification-Review.png`](./SCR-20-Property-Verification-Review.png) |
| **SCR-21A** | [User Management](#scr-21a--user-management) | Admin | Admin Portal | [`SCR-21A-User-Management.png`](./SCR-21A-User-Management.png) |
| **SCR-21B** | [Platform Settings](#scr-21b--platform-settings) | Admin | Admin Portal | [`SCR-21B-Platform-Settings.png`](./SCR-21B-Platform-Settings.png) |
| **SCR-21C** | [Audit Log Viewer](#scr-21c--audit-log-viewer) | Admin | Admin Portal | [`SCR-21C-Audit-Log-Viewer.png`](./SCR-21C-Audit-Log-Viewer.png) |
| **SCR-22** | [Homepage (Browse & Search)](#scr-22--homepage) | Guest / Public | Public Portal | [`SCR-22-Homepage-Browse-Search.png`](./SCR-22-Homepage-Browse-Search.png) |
| **SCR-23** | [Search Accommodation](#scr-23--search-accommodation) | Guest / Public | Public Portal | [`SCR-23-Search-Accommodation-Filters.png`](./SCR-23-Search-Accommodation-Filters.png) |
| **SCR-24** | [Search Results](#scr-24--search-results) | Guest / Public | Public Portal | [`SCR-24-Search-Results.png`](./SCR-24-Search-Results.png) |
| **SCR-25** | [Property Details](#scr-25--property-details) | Guest / Public | Public Portal | [`SCR-25-Property-Details.png`](./SCR-25-Property-Details.png) |
| **SCR-29** | [404 Not Found](#scr-29--404-not-found) | Global Error | Public Minimal | [`SCR-29-404-Not-Found.png`](./SCR-29-404-Not-Found.png) |
| **SCR-ERR** | [Offline / Server Error](#scr-err--offline--server-error) | Global Error | Public Minimal | [`SCR-ERR-Global-Offline-Server-Error.png`](./SCR-ERR-Global-Offline-Server-Error.png) |

---

## 3. Screen Specifications & Element Callouts

### SCR-01 · Sign In
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-01-Sign-In.png`](./SCR-01-Sign-In.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Sign in to FindStay | Heading | Page title |
| **2** | Email or phone | Input | Sign-in identifier; validated on blur |
| **3** | Password | Input | Masked field; show/hide toggle |
| **4** | Forgot password? | Secondary Link | Opens `SCR-04` |
| **5** | Sign in | Primary Action | `POST /auth/session`; spinner while loading; inline error or lockout notice on failure |
| **6** | Create account | Secondary Link | Opens `SCR-02` |

---

### SCR-02 · Create Account
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-02-Create-Account.png`](./SCR-02-Create-Account.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Create your account | Heading | Page title |
| **2** | Full name | Input | Required field |
| **3** | Email or phone | Input | Required; duplicate shows inline error |
| **4** | Password | Input | Live policy checklist displayed underneath |
| **5** | I accept the Privacy Notice (Act 843) | Checkbox | Required; submit blocked until checked; records consent |
| **6** | Create account | Primary Action | Registers user account, then navigates to `SCR-03A` / `03B` |
| **7** | Already registered? Sign in | Secondary Link | Opens `SCR-01` |

---

### SCR-03A · Account Verification (OTP)
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-03A-Account-Verification-OTP.png`](./SCR-03A-Account-Verification-OTP.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Verify your account | Heading | Page title |
| **2** | Code sent to your email/phone | Text | Tells user where the verification code went |
| **3** | 6-digit code | OTP Input | Large boxes; auto-advance; clipboard paste supported |
| **4** | Verify | Primary Action | Submits code; inline error if invalid or expired |
| **5** | Resend code | Secondary Button | Disabled during cooldown countdown timer |

---

### SCR-03B · Email Link Landing
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-03B-Email-Link-Landing.png`](./SCR-03B-Email-Link-Landing.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Status card | Banner | State card: `Verified` / `Already verified` / `Link expired` (Icon + text per state) |
| **2** | Continue to sign in | Primary Action | Opens `SCR-01` |
| **3** | Resend link | Secondary Action | Only displayed when link is expired |

---

### SCR-04 · Forgot Password
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-04-Forgot-Password.png`](./SCR-04-Forgot-Password.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Reset your password | Heading | Page title |
| **2** | Registered email | Input | Required email input |
| **3** | Send reset link | Primary Action | Requests password reset; transitions to `SCR-05` flow |
| **4** | Back to sign in | Secondary Link | Opens `SCR-01` |

---

### SCR-05 · Reset Password
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-05-Reset-Password.png`](./SCR-05-Reset-Password.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Choose a new password | Heading | Page title |
| **2** | New password | Input | Masked password field |
| **3** | Confirm password | Input | Must match new password |
| **4** | Policy checklist (length, number…) | Indicator List | Checklist ticks dynamically in real time as rules are satisfied |
| **5** | Update password | Primary Action | Inline error if expired link; success navigates to `SCR-01` |

---

### SCR-06 · Profile & Notification Preferences
- **Layout:** Owner/User portal layout (`o`), tabbed navigation on phone, sidebar on desktop.
- **Export Image:** [`SCR-06-Profile-Notification-Preferences.png`](./SCR-06-Profile-Notification-Preferences.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Profile / Notifications | Tabs / Sidebar | Switch between profile details and notification settings |
| **2** | Name | Input | Editable profile field |
| **3** | Contact details | Input | Editable; saved via `PATCH /me` |
| **4** | Email | Toggle | Notification channel toggle |
| **5** | SMS | Toggle | Notification channel toggle |
| **6** | In-app | Toggle | Notification channel toggle |
| **7** | Switch portal | Secondary Action | Opens `SCR-06B` (for users with multiple roles) |
| **8** | Save changes | Primary Action | Persists profile and notification preferences; banner on failure |
| **9** | Log out | Secondary Action | Terminates authenticated session, navigates to `SCR-01` |

---

### SCR-06B · Role / Portal Picker
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-06B-Role-Portal-Picker.png`](./SCR-06B-Role-Portal-Picker.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Choose a portal | Heading | Page title |
| **2** | Guest | Card / Tile | Enters Guest Portal -> Homepage `SCR-22` |
| **3** | Owner / Staff | Card / Tile | Enters Owner Operations Portal -> `SCR-07` |
| **4** | Admin | Card / Tile | Only shown if user holds `Admin` role -> `SCR-18` |

---

### SCR-06C · Policy Re-Consent Gate
- **Layout:** Centered modal/card (`c`), blocking entry until resolved.
- **Export Image:** [`SCR-06C-Policy-Re-Consent-Gate.png`](./SCR-06C-Policy-Re-Consent-Gate.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Our privacy policy has changed | Notice Banner | Blocks entry until acknowledged |
| **2** | Summary of changes + link | Text | Summary of amendments with readable link before acceptance |
| **3** | I accept policy version X | Checkbox | Mandatory agreement checkbox |
| **4** | Accept and continue | Primary Action | Records legal consent audit record and grants access |
| **5** | Log out | Secondary Action | Only alternative to accepting |

---

### SCR-06D · Session Expired
- **Layout:** Centered card (`c`), shown upon 401 error or JWT refresh failure.
- **Export Image:** [`SCR-06D-Session-Expired-Redirect.png`](./SCR-06D-Session-Expired-Redirect.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Your session has expired | Warning Banner | Shown on 401 Unauthorized or refresh failure |
| **2** | Please sign in again to continue | Text | Clear plain explanation |
| **3** | Sign in again | Primary Action | Opens `SCR-01` with redirect back to previous page |

---

### SCR-07 · Owner Dashboard
- **Layout:** Owner portal shell (`o`) with bottom bar on mobile / sidebar on desktop.
- **Export Image:** [`SCR-07-Owner-Dashboard.png`](./SCR-07-Owner-Dashboard.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Verification status banner | Banner | `Pending` / `Approved` / `Rejected`, icon + text; links to `SCR-10` |
| **2** | Active listings | Metric Card | Count of live properties; opens `SCR-07B` |
| **3** | Pending review | Metric Card | Count of property submissions waiting for admin review |
| **4** | Alerts | Metric Card | Admin decisions or requested corrections needing action |
| **5** | + Add property | Button | Initiates creation workflow -> `SCR-11` |

---

### SCR-07B · Owner Listings List
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-07B-Owner-Listings-List.png`](./SCR-07B-Owner-Listings-List.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Status filter chips | Filter Bar | Filter by: `All`, `Draft`, `Pending`, `Live`, `Paused` |
| **2** | Property card | Card Item | Photo thumbnail, title, status badge; tap opens `SCR-14`; Pause / Activate action (FR-13) |
| **3** | + Add property | Primary Action | Opens `SCR-11`; acts as empty-state CTA when no listings exist |

---

### SCR-08 · Organisation & Staff Setup
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-08-Organisation-Staff-Setup.png`](./SCR-08-Organisation-Staff-Setup.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Organisation name | Input | Edit company / business space name |
| **2** | Staff list | List Rows | Name, role, property scope; tapping row opens editor |
| **3** | Invite staff | Primary Action | Opens invitation sheet: email, role selection, property multi-select |

---

### SCR-08B · Staff Invitation Acceptance
- **Layout:** Centered card (`c`), phone 360px & desktop ≥1024px.
- **Export Image:** [`SCR-08B-Staff-Invitation-Acceptance.png`](./SCR-08B-Staff-Invitation-Acceptance.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Join [Organisation] | Heading | Page title with organization name |
| **2** | Role and assigned properties | Read-only Summary | Displays designated role and property scope |
| **3** | Set password | Input | New users only; existing users sign in directly |
| **4** | I accept the Privacy Notice | Checkbox | Mandatory acceptance for new users |
| **5** | Accept invitation | Primary Action | Joins organization, navigates to `SCR-07` scoped to assigned properties |

---

### SCR-09 · Owner Verification Upload
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-09-10-Owner-Verification-Status.png`](./SCR-09-10-Owner-Verification-Status.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Ghana Card | Upload Card | Upload card + status indicator; attach file/photo |
| **2** | Ownership proof | Upload Card | Land title / tenancy / utility proof upload |
| **3** | GTA licence | Upload Card | Ghana Tourism Authority licence document upload |
| **4** | Submit for review | Primary Action | Disabled until all required docs attached; on rejection, only rejected doc re-uploads |

---

### SCR-10 · Owner Verification Status
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-09-10-Owner-Verification-Status.png`](./SCR-09-10-Owner-Verification-Status.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Overall: Pending | Status Chip | Overall status chip with icon + text |
| **2** | Document items | List Rows | Per-document status: `Ghana Card · Approved ✓`, `Ownership proof · Rejected ✗`, `GTA licence · Pending ⏳` |
| **3** | Rejection note from admin | Banner | Displays feedback explaining why a document was rejected |
| **4** | Re-upload document | Action Button | Opens `SCR-09` for the rejected document only |

---

### SCR-11 · Add / Edit Property Form
- **Layout:** Owner portal shell (`o`), accordion steps on phone, 2-column layout on desktop.
- **Export Image:** [`SCR-11-Add-Edit-Property-Multi-Unit-Form.png`](./SCR-11-Add-Edit-Property-Multi-Unit-Form.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Draft auto-saved | Status Banner | Real-time auto-save indicator |
| **2** | Step tabs / accordion | Navigation | Sections: `Details`, `Location`, `Amenities`, `Rules` |
| **3** | Property name | Input | Required property name |
| **4** | Address / area | Input | Required location / address field |
| **5** | Amenities checklist | Checklist | Multi-select amenities checkboxes |
| **6** | Next: units | Primary Action | Validates inputs, proceeds to `SCR-11B` |
| **7** | Pause listing | Secondary Action | Pauses or deactivates an existing property listing |

---

### SCR-11B · Multi-Unit Editor
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-11-Add-Edit-Property-Multi-Unit-Form.png`](./SCR-11-Add-Edit-Property-Multi-Unit-Form.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Unit rows | List Rows | Existing unit rows: name, rate, billing period; tap to edit or delete |
| **2** | Unit name | Input | Required unit name / identifier |
| **3** | Rate (GH₵) | Currency Input | Displayed in Ghana Cedis (`GH₵`), persisted as pesewas |
| **4** | Billing period | Select | Selection (e.g., Nightly, Monthly, Annual) |
| **5** | Add unit | Action Button | Bottom sheet on mobile, drawer on desktop |
| **6** | Next: photos | Primary Action | Requires at least 1 valid unit; opens `SCR-12` |

---

### SCR-11C · Listing Preview
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-11C-Listing-Preview.png`](./SCR-11C-Listing-Preview.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Guest-view preview | Media Area | Exact preview of how guests see the property card and gallery |
| **2** | Details, units, GH₵ price | Read-only Summary | Read-only breakdown of details, units, pricing |
| **3** | Back to edit | Secondary Action | Returns to `SCR-11` editor |
| **4** | Submit for review | Primary Action | Sticky submission bar; transitions to `SCR-13`; handles 409 if already submitted |

---

### SCR-12 · Photo Management
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-12-Photo-Management.png`](./SCR-12-Photo-Management.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | + Upload photo | Button | WebP upload, max 10 photos per listing |
| **2** | Photo tiles | Media Grid | Cover badge indicator, drag-and-drop reorder, replace, delete |
| **3** | x of 10 photos used | Cap Indicator | Progress counter showing remaining upload capacity |
| **4** | Continue to preview | Primary Action | Opens `SCR-11C` preview |

---

### SCR-13 · Property Submission Status
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-13-Property-Submission-Status.png`](./SCR-13-Property-Submission-Status.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Status timeline | Timeline Chips | `Draft` → `Pending review` → `Approved / Corrections / Rejected` with icons and labels |
| **2** | Correction list | List / Note | Displayed when corrections are requested by administrator |
| **3** | Fix and resubmit | Primary Action | Opens `SCR-11`; when approved, navigates to `SCR-14` |

---

### SCR-14 · Manage Property & Units
- **Layout:** Owner portal shell (`o`), action list on mobile, tabs on desktop.
- **Export Image:** [`SCR-14-Manage-Property-Units.png`](./SCR-14-Manage-Property-Units.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Property summary header | Header | Name, active status, thumbnail photo |
| **2** | Overview / Units / Calendar | Tabs / Menu | Tabs on desktop; linear action list on mobile |
| **3** | Action items | Actions | Edit details (`SCR-11`), Pause / Activate toggle, Units (`SCR-11B`), Availability calendar (`SCR-15`) |

---

### SCR-15 · Unit Availability Calendar
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-15-Unit-Availability-Calendar.png`](./SCR-15-Unit-Availability-Calendar.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Unit name + switcher | Header | Unit selector and previous/next month controls |
| **2** | Month grid | Calendar Grid | Month view distinguishing `Available` vs `Owner-blocked` (Booked states arrive in Sprint 2+) |
| **3** | Available ▢ / Blocked ▨ | Legend | Legend uses pattern hatching + text label (not color only) |
| **4** | Block dates | Primary Action | Opens date block modal/sheet -> `SCR-16` |

---

### SCR-16 · Block / Unblock Dates
- **Layout:** Owner portal shell (`o`).
- **Export Image:** [`SCR-16-Block-Unblock-Dates-Form.png`](./SCR-16-Block-Unblock-Dates-Form.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Start date | Date Input | Shown in Ghana time (`Africa/Accra`) |
| **2** | End date | Date Input | Must follow start date; validated inline |
| **3** | Dates stored in UTC | Helper Text | Clarification helper note |
| **4** | Save block | Primary Action | Saves calendar block; returns 409 conflict if date range overlaps |
| **5** | Remove block / Cancel | Secondary Action | Removes existing block or cancels action |

---

### SCR-17 · Admin Sign In
- **Layout:** Centered card (`c`), dedicated administrator entrance.
- **Export Image:** [`SCR-17-Admin-Sign-In.png`](./SCR-17-Admin-Sign-In.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Admin sign in | Heading | Admin sign-in title |
| **2** | Email | Input | Admin user email |
| **3** | Password | Input | Masked password |
| **4** | Sign in | Primary Action | Authenticates session; returns 403 Forbidden if account lacks Admin role |

---

### SCR-18 · Admin Dashboard
- **Layout:** Admin portal shell (`a`), persistent navigation drawer / desktop sidebar.
- **Export Image:** [`SCR-18-Admin-Dashboard.png`](./SCR-18-Admin-Dashboard.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Pending verifications | Metric Card | Count of pending owner verification submissions; links to `SCR-19` |
| **2** | Pending listings | Metric Card | Count of pending property submissions; links to `SCR-19` |
| **3** | Users | Metric Card | Total registered users metric |
| **4** | Recent alerts | Metric Card | Latest system audit events and alert logs |

---

### SCR-19 · Submitted Review Queue
- **Layout:** Admin portal shell (`a`).
- **Export Image:** [`SCR-19-Submitted-Review-Queue.png`](./SCR-19-Submitted-Review-Queue.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Queue filters | Filter Chips | Filter options: `All`, `Verifications`, `Listings` |
| **2** | Queue items | List Cards | Owner name, item type, age badge; tapping opens review `SCR-20` |
| **3** | All caught up | Empty State | Displayed when queue contains zero items |

---

### SCR-20 · Property & Verification Review
- **Layout:** Admin portal shell (`a`).
- **Export Image:** [`SCR-20-Property-Verification-Review.png`](./SCR-20-Property-Verification-Review.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Listing photos | Media Viewer | Inspection carousel for uploaded images |
| **2** | Documents review | Action List | Per-document decision: `Ghana Card`, `Ownership proof`, `GTA licence` (Approve / Reject) |
| **3** | Notes | Input Area | Required justification notes when requesting corrections or rejecting |
| **4** | Approve | Primary Action | Approves submission (sticky decision bar on mobile) |
| **5** | Request corrections | Secondary Action | Requires specific fix checklist before submitting |
| **6** | Reject | Danger Action | Rejects submission; requires reason |

---

### SCR-21A · User Management
- **Layout:** Admin portal shell (`a`).
- **Export Image:** [`SCR-21A-User-Management.png`](./SCR-21A-User-Management.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Search users | Search Input | Filter users by full name or email |
| **2** | User rows | Table / List | Name, assigned roles, account status; tapping row opens actions |
| **3** | Suspend / Restore | Action Dialog | Requires confirmation; immediately revokes active sessions on suspension |

---

### SCR-21B · Platform Settings
- **Layout:** Admin portal shell (`a`).
- **Export Image:** [`SCR-21B-Platform-Settings.png`](./SCR-21B-Platform-Settings.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Settings groups | Setting List | Categories: `General`, `Policy version`, `Feature flags` |
| **2** | Selected setting value | Input | Editable key/value setting |
| **3** | Save settings | Primary Action | Persists setting change and records an immutable audit log entry |

---

### SCR-21C · Audit Log Viewer
- **Layout:** Admin portal shell (`a`), compact cards on mobile, table on desktop.
- **Export Image:** [`SCR-21C-Audit-Log-Viewer.png`](./SCR-21C-Audit-Log-Viewer.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Filter by actor / action | Search Input | Search filter |
| **2** | Date range / Action type | Filter Chips | Quick date and event category filters |
| **3** | Event rows | Read-only List | Displays Ghana timestamp, actor ID, action name, target entity |

---

### SCR-22 · Homepage (Browse & Search)
- **Layout:** Public portal (`p`), search bar header, responsive accommodation grid.
- **Export Image:** [`SCR-22-Homepage-Browse-Search.png`](./SCR-22-Homepage-Browse-Search.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Search: where to? | Search Trigger | Opens destination & filter search sheet -> `SCR-23` |
| **2** | Featured accommodation | Section Header | Section title |
| **3** | Featured property cards | Property Cards | Cover photo, title, `GH₵` price, `Verified` badge; tap opens details `SCR-25` |

---

### SCR-23 · Search Accommodation
- **Layout:** Full-screen sheet on mobile, sidebar filter on desktop.
- **Export Image:** [`SCR-23-Search-Accommodation-Filters.png`](./SCR-23-Search-Accommodation-Filters.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Destination | Input | City / town / neighborhood input |
| **2** | Dates | Date Picker | Check-in and check-out stay dates |
| **3** | Guests | Stepper | Guest headcount |
| **4** | Filters | Filter List | Price slider and facilities checkboxes |
| **5** | Show results | Primary Action | Executes search and navigates to `SCR-24` |

---

### SCR-24 · Search Results
- **Layout:** Public portal (`p`), grid list of matched accommodations.
- **Export Image:** [`SCR-24-Search-Results.png`](./SCR-24-Search-Results.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Sort & Filters | Control Bar | Sort dropdown and filter triggers |
| **2** | Listing cards | Card Items | Property photo, `GH₵` price per night/month, `Verified` badge; opens `SCR-25` |
| **3** | No matches – Clear filters | Empty State | Shown when search filters return zero properties |

---

### SCR-25 · Property Details
- **Layout:** Public portal (`p`).
- **Export Image:** [`SCR-25-Property-Details.png`](./SCR-25-Property-Details.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Photo carousel / gallery | Media Gallery | Swipe carousel on mobile; expanded grid on desktop |
| **2** | Name, GH₵ price, Verified Owner badge | Title Block | Property name, price in `GH₵`, verified badge with icon and label |
| **3** | Facilities / Location / Rules | Detail Sections | Accordion or tabbed specifications |
| **4** | Save / Share | Utility Actions | Sprint 3 stub (disabled) |
| **5** | Make a booking | Primary CTA | Sprint 2+ feature; sticky CTA on mobile, prompts sign-in if unauthenticated |

---

### SCR-29 · 404 Not Found
- **Layout:** Public minimal layout (`p`).
- **Export Image:** [`SCR-29-404-Not-Found.png`](./SCR-29-404-Not-Found.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Page not found | Error Block | 404 icon and user-friendly error message |
| **2** | Go home | Primary Action | Returns user to homepage `SCR-22` |

---

### SCR-ERR · Offline / Server Error
- **Layout:** Public minimal layout (`p`).
- **Export Image:** [`SCR-ERR-Global-Offline-Server-Error.png`](./SCR-ERR-Global-Offline-Server-Error.png)

| # | Element | Type | Purpose / Action |
| :-: | :--- | :--- | :--- |
| **1** | Something went wrong | Error Block | Connectivity / server error icon with clear message |
| **2** | Check your connection and try again | Explanatory Text | Plain language explanation |
| **3** | Retry | Primary Action | Re-attempts the failed network request |

