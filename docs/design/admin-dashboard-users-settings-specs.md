# FindStay — Admin Dashboard, User Management & Platform Settings Screen Specifications (`S1-16-T1`)

- **Task:** [`S1-16-T1`](../scrum/sprint-01/stories/S1-16/tasks/S1-16-T1.md) (Issue [#86](https://github.com/ObboyeBossman/findstay/issues/86))
- **Story:** [`S1-16`](../scrum/sprint-01/stories/S1-16/README.md) — Admin Dashboard, Users & Settings
- **Wireframes:** [`SCR-18-Admin-Dashboard.png`](./wireframes/SCR-18-Admin-Dashboard.png), [`SCR-21A-User-Management.png`](./wireframes/SCR-21A-User-Management.png), [`SCR-21B-Platform-Settings.png`](./wireframes/SCR-21B-Platform-Settings.png)
- **User Flows:** [`user-flows.md`](./user-flows.md) (§5 Administrator Journey)
- **API Contract:** [`backend-architecture.md`](./backend-architecture.md) §5–§6 & [`api/openapi.yaml`](../../api/openapi.yaml)
- **Tokens & Shell:** [`web/src/theme/tokens.css`](../../web/src/theme/tokens.css), [`AdminLayout.tsx`](../../web/src/layouts/AdminLayout.tsx)
- **Author:** Anthony Maclean (`@dztrb`)

This specification defines the `360px` mobile and desktop layout, summary KPI cards, searchable user management table/cards, Create/Suspend/Restore user modals, and key-value/feature-flag controls for **`SCR-18` (`/admin`)**, **`SCR-21A` (`/admin/users`)**, and **`SCR-21B` (`/admin/settings`)**, serving as the blueprint for **`S1-16-T5`**.

> [!NOTE]
> **Scope Boundary:** This specification covers `SCR-18`, `SCR-21A`, and `SCR-21B`. The Admin Audit Log Viewer (`SCR-21C` — `/admin/audit`) is specified under `S1-08-T1`.

---

## 1. Traceability & Design Token Compliance

- **Requirements:** `UR-A01`, `FR-87`, `UR-A08`, `FR-92`, `FR-86`, `BRL-13`, `BRL-16`.
- **Visual Rules (`docs/rules/design-system-and-theming.md`):**
  - Rendered inside [`AdminLayout`](../../web/src/layouts/AdminLayout.tsx) (`bg-earth text-on-brand` header/sidebar badge, `240px` desktop sidebar, `56px` mobile top bar + `64px` sticky bottom bar).
  - Use only Tailwind utilities backed by `web/src/theme/tokens.css` (`bg-canvas`, `bg-surface-card`, `bg-surface-muted`, `border-border-subtle`, `text-earth`, `bg-olive`, `hover:bg-olive-hover`, `text-on-brand`, `min-h-touch`).
  - Zero hard-coded visual values (`npm run lint:theme`).
  - All timestamps stored in UTC and displayed in **`Africa/Accra` (Ghana time)**.
  - Status and role badges use `<StatusBadge />` (icon + text label + border contrast per `NFR-07`).

---

## 2. Screen 1: Admin Dashboard (`SCR-18` — `/admin`)

Fetches platform summary metrics from **`GET /api/v1/admin/dashboard`**.

### 2.1 Responsive Layout (`360px` Mobile vs. Desktop `1024px+`)

```text
MOBILE (360px — 1-col KPI stack, 0px horizontal scroll)   DESKTOP (1024px+ — inside AdminLayout 240px sidebar)
+---------------------------------------------------+     +-------------------------------------------------------------------+
| Breadcrumb: Admin > Dashboard                     |     | Breadcrumb: Admin / Dashboard                   [Refresh Metrics] |
| Platform Administration                           |     | Platform Administration                                           |
+---------------------------------------------------+     +---------------+---------------+-----------------+-----------------+
| KPI 1: Pending Verifications  [Warning Badge]     |     | KPI 1:        | KPI 2:        | KPI 3:          | KPI 4:          |
|        Count (text-heading-3) · [Open Queue ->]   |     | Pending       | Pending       | Active          | Total Users     |
+---------------------------------------------------+     | Verifications | Listings      | Published       | (& Suspended    |
| KPI 2: Pending Listings       [Warning Badge]     |     | [Open Queue]  | [Open Queue]  | Listings        |  sub-count)     |
|        Count (text-heading-3) · [Open Queue ->]   |     +---------------+---------------+-----------------+-----------------+
+---------------------------------------------------+     | Quick Actions Bar                                                 |
| KPI 3: Active Published Listings [Success Badge]  |     | [Review Submissions (/admin/reviews)] [Manage Users (/admin/users)]|
|        Count (text-heading-3)                     |     | [Platform Settings (/admin/settings)] [Audit Log (/admin/audit)]  |
+---------------------------------------------------+     +-------------------------------------------------------------------+
| KPI 4: Total Users (Active / Suspended breakdown) |
|        Count · [Manage Users ->]                  |
+---------------------------------------------------+
| Quick Actions (full-width min-h-touch buttons)    |
| [Review Submissions]  [Manage Users]  [Settings]  |
+---------------------------------------------------+
```

### 2.2 KPI Metric Cards Specification (`GET /api/v1/admin/dashboard`)

| Card Title | API Field(s) | Icon & `<StatusBadge />` | Quick Shortcut |
| :--- | :--- | :--- | :--- |
| **Pending Verifications** | `pendingVerificationsCount` | `ShieldCheck` · `warning` if `> 0`, `success` if `0` | Links to `/admin/reviews?type=verification` |
| **Pending Listings** | `pendingListingsCount` | `ClipboardCheck` · `warning` if `> 0`, `success` if `0` | Links to `/admin/reviews?type=listing` |
| **Active Published Listings** | `publishedListingsCount` | `Building2` · `success` (`"Live"`) | Links to `/admin/reviews?status=approved` |
| **Platform Users** | `totalUsersCount`, `suspendedUsersCount` | `Users` · `info` (`"{suspendedUsersCount} suspended"`) | Links to `/admin/users` |

---

## 3. Screen 2: User Management (`SCR-21A` — `/admin/users`)

Supports searching/filtering accounts, creating users, and suspending or restoring accounts (`GET /api/v1/admin/users`, `POST /api/v1/admin/users`, `POST /api/v1/admin/users/{id}/suspend`, `POST /api/v1/admin/users/{id}/restore`).

### 3.1 Responsive Layout (`360px` Mobile Cards vs. Desktop Table)

```text
MOBILE (360px — stacked filter controls & user cards)     DESKTOP (1024px+ — filter bar + table)
+---------------------------------------------------+     +-------------------------------------------------------------------+
| Breadcrumb: Admin > Users                         |     | Breadcrumb: Admin / Users                         [+ Create User] |
| User Management        [+ Create User (full-wid)] |     | User Management                                                   |
+---------------------------------------------------+     +-------------------------------------------------------------------+
| [Search by name or email...         ] (min-h-touch)|    | [Search name or email...      ]  Status: [All | Active | Suspended]|
| Status: [All] [Active] [Suspended]                |     +-------------------------------------------------------------------+
+---------------------------------------------------+     | Name & Email   | Roles         | StatusBadge | Joined (GMT) | Act |
| User Card 1 (bg-surface-card)                     |     |----------------|---------------|-------------|--------------|-----|
|   Kofi Mensah · kofi@example.com                  |     | Kofi Mensah    | [Owner]       | [Active]    | 16 Nov 2026  | ... |
|   Roles: [Owner] [Guest]                          |     | Ama Boateng    | [Guest]       | [Suspended] | 15 Nov 2026  | ... |
|   Status: [Active (success)]                      |     +-------------------------------------------------------------------+
|   Joined: 16 Nov 2026, 10:15 GMT                  |     | Pagination: Showing 1–20 of N               [Previous] [Next]     |
|   [Suspend User]                                  |     +-------------------------------------------------------------------+
+---------------------------------------------------+
```

### 3.2 Controls, Columns & Badges

- **Search Input:** Queries `q` parameter (debounced 300ms) matching `displayName` or `email`.
- **Status Filter Pills (`min-h-touch`):** `ALL` (default), `ACTIVE`, `SUSPENDED`.
- **Pagination:** `limit=20`, `offset=0` per `backend-architecture.md` §4.8.
- **Account Status Badge:**
  - `ACTIVE` → `<StatusBadge variant="success" label="Active" />`
  - `SUSPENDED` → `<StatusBadge variant="error" label="Suspended" />`
- **Role Badges:** Renders pills for assigned global/org roles (`GUEST`, `OWNER`, `STAFF`, `ADMIN`).
- **Self-Protection Rule:** The currently signed-in administrator's own row disables `[Suspend User]` (`disabled` with tooltip/caption `"You cannot suspend your own admin account"`).

### 3.3 Modals (`Create User`, `Suspend User`, `Restore User`)

#### A. Create User Modal (`POST /api/v1/admin/users`)
- **Fields:**
  - `email` (`<FormField type="email" required label="Email Address" />`)
  - `displayName` (`<FormField type="text" required label="Full Name" />`)
  - `phone` (`<FormField type="tel" label="Phone Number (Optional)" />`)
  - `role` (Select: `GUEST`, `OWNER`, `ADMIN` — defaults to `GUEST`)
- **Action:** Provisions the user via Supabase service-role Admin API, sends an invitation/confirmation email, records `x-audit-event: user.admin_created`, refreshes the list, and shows a `success` toast: **"User account created for {email}"**.

#### B. Suspend User Confirmation Modal (`POST /api/v1/admin/users/{id}/suspend`)
- **Warning Callout (`bg-status-warning-bg border-status-warning-border text-status-warning-fg`):**
  - *"Suspending **{displayName} ({email})** immediately revokes their active session, blocks future sign-ins (`BRL-16`), and records a permanent entry in the activity log (`user.suspended`)."*
- **Mandatory Field:**
  - `reason` (`<FormField required label="Reason for Suspension" placeholder="e.g. Repeated policy violation or fraudulent document submission" />` — min 10 characters, max 500 characters).
  - Attempting to submit an empty or `< 10` char reason shows `<InlineError message="Enter a suspension reason (at least 10 characters)." />`.
- **Actions:** `[Cancel]` and **`[Confirm Suspension]`** (`bg-terracotta-dark text-on-brand min-h-touch`).
- **On `200 OK`:** Updates row status to `SUSPENDED`, triggers `USER_SUSPENDED` notification email, and shows `success` toast: **"Account suspended for {email}"**.

#### C. Restore User Confirmation Modal (`POST /api/v1/admin/users/{id}/restore`)
- **Confirmation Copy:**
  - *"Restore **{displayName} ({email})**? They will be able to sign in again immediately. This action is recorded in the permanent activity log (`user.restored`)."*
- **Optional Field:** `note` (`label="Restoration Note (Optional)"`).
- **Actions:** `[Cancel]` and **`[Restore Account]`** (`bg-olive text-on-brand min-h-touch`).
- **On `200 OK`:** Updates row status to `ACTIVE`, triggers `USER_RESTORED` notification email, and shows `success` toast: **"Account restored for {email}"**.

---

## 4. Screen 3: Platform Settings & Feature Flags (`SCR-21B` — `/admin/settings`)

Reads and updates `admin.platform_setting` rows via **`GET /api/v1/admin/settings`** and **`PATCH /api/v1/admin/settings`** (`x-audit-event: platform.setting_updated`).

### 4.1 Responsive Layout (`360px` Mobile & Desktop)

```text
+-------------------------------------------------------------------+
| Breadcrumb: Admin > Platform Settings                             |
| Platform Settings & Feature Flags                                 |
| [i] Every change on this page is permanently recorded in the      |
|     Audit Log with your admin ID, old value, and new value.       |
+-------------------------------------------------------------------+
| Section 1: Compliance & Platform Parameters (`isFeatureFlag=false`)|
| +---------------------------------------------------------------+ |
| | Key: `privacy.policy_version`                                 | |
| | Description: Privacy Notice version shown at registration;    | |
| |              Act 843 consent records reference this version.  | |
| | Current Value: [ 1          ] (FormField)   [Update Setting]  | |
| | Last updated: 17 Nov 2026, 00:00 GMT                          | |
| +---------------------------------------------------------------+ |
|                                                                   |
| Section 2: Feature Flags (`isFeatureFlag=true` — `flag.*`)        |
| +---------------------------------------------------------------+ |
| | Key: `flag.auth.sms_otp`                      Status: [OFF]   | |
| | SMS OTP for sign-up confirmation and sign-in.                 | |
| | [Toggle Switch (role="switch", min-h-touch)]                  | |
| +---------------------------------------------------------------+ |
| | Key: `flag.notifications.sms`                 Status: [OFF]   | |
| | SMS notification channel (P-08).                              | |
| | [Toggle Switch (role="switch", min-h-touch)]                  | |
| +---------------------------------------------------------------+ |
+-------------------------------------------------------------------+
```

### 4.2 Seeded Settings & Controls (`V1_13__seed_reference_lists.sql`)

| Setting `key` | `isFeatureFlag` | Seed Value | UI Control | Validation Rules |
| :--- | :---: | :---: | :--- | :--- |
| **`privacy.policy_version`** | `false` | `'1'` | Text/number `<FormField />` + `[Update]` button | Non-empty positive integer or semantic version string (max 32 chars). Note shown: *"Bumping this version prompts users to re-consent on next sign-in (`SCR-06C`)."* |
| **`flag.auth.sms_otp`** | `true` | `'false'` | Accessible toggle switch (`role="switch"`, `aria-checked`) + `<StatusBadge />` (`Enabled` / `Disabled`) | Boolean `'true'` or `'false'`. Ships `false` (`DEC-S1-01`). |
| **`flag.notifications.sms`** | `true` | `'false'` | Accessible toggle switch (`role="switch"`, `aria-checked`) + `<StatusBadge />` (`Enabled` / `Disabled`) | Boolean `'true'` or `'false'`. Ships `false` (`P-08`). |
| *(Additional `platform_setting` rows)* | `false` / `true` | Dynamic | Text input if `isFeatureFlag=false`; toggle switch if `isFeatureFlag=true` | Non-empty `value`. |

### 4.3 Save Confirmation Modal (Old vs. New Value + Audit Notice)

Before committing any `PATCH /api/v1/admin/settings` change, display a confirmation modal:
- **Title:** `"Confirm Setting Change"`
- **Diff Summary:**
  - **Key:** `{key}`
  - **Previous Value:** `{oldValue}`
  - **New Value:** `{newValue}`
- **Audit Notice:** *"This change takes effect immediately and will be written to `audit.audit_log` (`platform.setting_updated`)."*
- **Actions:** `[Cancel]` and **`[Save Setting]`** (`bg-olive text-on-brand min-h-touch`).

---

## 5. State Matrix (`S1-03-T5` Components)

| Screen | Loading State (`Skeleton`) | Empty State (`EmptyState`) | Error / Validation State (`InlineError` / `Toast`) |
| :--- | :--- | :--- | :--- |
| **`SCR-18` Admin Dashboard** | 4 `<SkeletonCard />` blocks in the KPI grid | KPI cards display `0` with `<StatusBadge variant="success" label="All Caught Up" />` | Error banner with `[Retry]` if `GET /admin/dashboard` fails |
| **`SCR-21A` User Management** | `<SkeletonList count={4} />` | `<EmptyState title="No matching users" description="No user accounts match your current search or status filter." actionLabel="Clear Filters" />` | `<InlineError />` on Create User / Suspend reason; `error` toast on API error |
| **`SCR-21B` Platform Settings** | `<SkeletonList count={3} />` | `<EmptyState title="No platform settings configured" description="Seed settings via Flyway V1_13." />` | `<InlineError />` if setting value is blank; `error` toast + rollback toggle state if `PATCH /admin/settings` fails |
