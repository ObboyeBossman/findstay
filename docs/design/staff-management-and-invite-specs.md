# FindStay — Staff Management & Invite Acceptance Screen Specifications (`S1-07-T1`)

- **Task:** [`S1-07-T1`](../scrum/sprint-01/stories/S1-07/tasks/S1-07-T1.md) (Issue [#68](https://github.com/ObboyeBossman/findstay/issues/68))
- **Story:** [`S1-07`](../scrum/sprint-01/stories/S1-07/README.md) — Owner Companies & Staff Access
- **Wireframes:** [`SCR-08-Organisation-Staff-Setup.png`](./wireframes/SCR-08-Organisation-Staff-Setup.png), [`SCR-08B-Staff-Invitation-Acceptance.png`](./wireframes/SCR-08B-Staff-Invitation-Acceptance.png)
- **User Flows:** [`user-flows.md`](./user-flows.md) (§3 Staff Onboarding Flow, §4 Owner Journey)
- **API Contract:** [`backend-architecture.md`](./backend-architecture.md) §5–§6 & [`api/openapi.yaml`](../../api/openapi.yaml)
- **Tokens & Shell:** [`web/src/theme/tokens.css`](../../web/src/theme/tokens.css), [`OwnerLayout.tsx`](../../web/src/layouts/OwnerLayout.tsx)
- **Author:** Anthony Maclean (`@dztrb`)

This specification defines the `360px` mobile and desktop layout, fields, per-property permission controls, status badges, API bindings, and Loading/Empty/Error/Toast states for **`SCR-08` (`/owner/org`)** and **`SCR-08B` (`/owner/invitations/:token`)**, serving as the blueprint for **`S1-07-T6`**.

---

## 1. Traceability & Design Token Compliance

- **Requirements & Decisions:** `BRL-04`, `BRL-05`, `FR-09`, `UR-O15`, `UR-PS01`, `UR-PSN01`, `UR-PM03`, `J-06`, `P-04`.
- **Visual Rules (`docs/rules/design-system-and-theming.md`):**
  - Use only Tailwind utilities backed by `web/src/theme/tokens.css` (`bg-canvas`, `bg-surface-card`, `bg-surface-muted`, `border-border-subtle`, `text-earth`, `bg-olive`, `hover:bg-olive-hover`, `text-on-brand`, `min-h-touch`).
  - Zero hard-coded hex/px/rem values (`npm run lint:theme` guard).
  - All timestamps stored in UTC and formatted in **`Africa/Accra` (Ghana time)** at display.
  - Every status badge uses `<StatusBadge />` (icon + text label + border contrast; never colour alone per `NFR-07`).

---

## 2. Screen 1: Company & Staff Management (`SCR-08` — `/owner/org`)

Rendered inside [`OwnerLayout`](../../web/src/layouts/OwnerLayout.tsx) under `[OrgScope]`. Comprises four sections:
1. **Company Profile Card** (`GET /api/v1/owner/org`, `PATCH /api/v1/owner/org`)
2. **Invite Staff Form / Modal** (`POST /api/v1/owner/invitations`)
3. **Active Team Members List** (`GET /api/v1/owner/members`, `PATCH /api/v1/owner/members/{userId}`)
4. **Outstanding Invitations List** (`GET /api/v1/owner/invitations`)

### 2.1 Responsive Layout (`360px` Mobile vs. Desktop `1024px+`)

```text
MOBILE (360px — single column, 0px horizontal scroll)     DESKTOP (1024px+ — inside OwnerLayout 240px sidebar)
+---------------------------------------------------+     +-------------------------------------------------------------------+
| Breadcrumb: Owner > Team & Org                    |     | Breadcrumb: Owner / Team & Org                   [+ Invite Staff] |
| Team & Company Space                              |     | Team & Company Space                                              |
| [+ Invite Staff (full-width min-h-touch)]         |     +-------------------------------+-----------------------------------+
+---------------------------------------------------+     | 1. Company Profile Card       | 2. Invite Staff Panel / Modal     |
| 1. Company Profile Card (bg-surface-card)         |     |    - name, displayName        |    - email (required)             |
|    - Legal Name (`name`)                          |     |    - contactEmail, Phone      |    - Role: STAFF (fixed pill)     |
|    - Display Name (`displayName`)                 |     |    - Verification StatusBadge |    - Property Scope Checkboxes    |
|    - Contact Email (`contactEmail`)               |     |    [Save Changes]             |    [Send Invitation]              |
|    - Contact Phone (`contactPhone`)               |     +-------------------------------+-----------------------------------+
|    - Verification Badge (`verificationStatus`)    |     | 3. Active Team Members Table (bg-surface-card)                    |
|    [Save Changes]                                 |     |    Name/Email | Role Badge | Assigned Properties | Joined | Action|
+---------------------------------------------------+     +-------------------------------------------------------------------+
| 2. Active Team Members (Stacked Cards)            |     | 4. Outstanding Invitations Table (bg-surface-card)                |
|    - Name & Email                                 |     |    Email | StatusBadge | Assigned Properties | Expires | Actions  |
|    - Role Badge: [Primary Owner] or [Staff]       |     +-------------------------------------------------------------------+
|    - Assigned Properties pills (`2 properties`)   |
|    - Joined date (`Africa/Accra`)                 |
|    - [Edit Access] / [Revoke All Access]          |
+---------------------------------------------------+
| 3. Outstanding Invitations (Stacked Cards)        |
|    - Invitee Email                                |
|    - StatusBadge: PENDING | EXPIRED | REVOKED     |
|    - Assigned Properties pills                    |
|    - Expires / Sent (`Africa/Accra`)              |
+---------------------------------------------------+
```

### 2.2 Section A — Company Profile Form (`GET / PATCH /api/v1/owner/org`)

| Field | API Property | Control (`FormField`) | Validation & Behaviour |
| :--- | :--- | :--- | :--- |
| **Company Legal Name** | `name` | Text input (`required`, `min-h-touch`) | Non-empty, max 120 chars. Inline error: `"Enter your company or business name."` |
| **Public Display Name** | `displayName` | Text input (`required`, `min-h-touch`) | Shown on guest listings (`SCR-25`). Non-empty, max 80 chars. |
| **Business Contact Email** | `contactEmail` | Email input (`required`, `min-h-touch`) | Valid email format. Inline error: `"Enter a valid business contact email."` |
| **Business Contact Phone** | `contactPhone` | Tel input (optional, `min-h-touch`) | Ghana phone format (`+233...` or `024...`, max 20 chars). |
| **Verification Status** | `verificationStatus` | Read-only `<StatusBadge />` | `APPROVED` → `success`; `PENDING` → `warning`; `PARTIALLY_REJECTED`/`REJECTED` → `error`; `NOT_SUBMITTED` → `info` + link to `/owner/verification`. |

- **Role Guard:** Only `OWNER` memberships can submit `PATCH /api/v1/owner/org`. `STAFF` members view fields in read-only mode.

### 2.3 Section B — Invite Staff Form (`POST /api/v1/owner/invitations`)

Triggered via `[+ Invite Staff]` (opens bottom sheet on `360px` mobile, modal dialog or side card on desktop).

| Field | API Property | Control | Validation & Rules |
| :--- | :--- | :--- | :--- |
| **Staff Email** | `email` | `<FormField type="email" required />` | Required valid email. Rejects if an open `PENDING` invite already exists for `(organization_id, email)` (`409 CONFLICT`). |
| **Role** | `role` | Read-only badge (`STAFF`) | Fixed to `'STAFF'` per `V1_05` `invitation_role_check`. |
| **Property Permissions** | `propertyIds: string[]` | Multi-select checkbox list of org properties (`GET /api/v1/owner/properties`) | Each row shows checkbox (`min-h-touch`), Property Name, and Location. Includes `"Select All Properties"` toggle. At least **1 property** must be checked (`UR-PS01`, `UR-PM03`). |

- **Empty Properties Guard:** If the organisation has `0` properties yet, display an inline info notice inside the property selector: *"You have not created any properties yet. Create a property first or invite staff and assign properties later."*
- **Submit Action:** Calls `POST /api/v1/owner/invitations` (`x-audit-event: org.staff_invited`). On `201 Created`:
  - Closes modal/sheet, refreshes `GET /api/v1/owner/invitations`.
  - Shows `success` toast: **"Invitation sent to {email}"** (*"They will receive an email link valid until {expiresAt in Africa/Accra}."*).

### 2.4 Section C — Active Team Members & Permission Editor (`GET / PATCH /api/v1/owner/members`)

- **Member Row / Card Fields:**
  - `displayName` & `email`
  - **Role Badge (`<StatusBadge />`):**
    - `role === 'OWNER'` & `isPrimaryOwner === true` → `<StatusBadge variant="success" label="Primary Owner" />` (locked; cannot be edited or revoked)
    - `role === 'OWNER'` → `<StatusBadge variant="info" label="Owner" />`
    - `role === 'STAFF'` → `<StatusBadge variant="info" label="Staff" />`
  - **Property Scope Summary:**
    - `OWNER`: `"All company properties"`
    - `STAFF`: Pill badges for each assigned `propertyId` (e.g., `"Takoradi Beach Lodge"`, `"+1 more"`), or `<StatusBadge variant="warning" label="No properties assigned" />` if all permissions were revoked.
  - `joinedAt`: Formatted in `Africa/Accra` (e.g., `"Joined 16 Nov 2026, 14:30 GMT"`).
- **Edit / Revoke Per-Property Permissions Drawer (`PATCH /api/v1/owner/members/{userId}`):**
  - Clicking **`[Edit Access]`** on a `STAFF` member opens the **Manage Staff Access** modal/sheet:
    - Shows checkboxes for every property in the organisation (`propertyIds: string[]`).
    - Owner can check/uncheck properties to grant or revoke per-property access (`UR-O15`, `UR-PM03`).
    - Clicking **`[Revoke All Property Access]`** unchecks all properties (`propertyIds: []`) after confirmation, immediately preventing that staff user from viewing or editing any property under `[OrgScope]`.
    - Saving calls `PATCH /api/v1/owner/members/{userId}` (`x-audit-event: org.staff_role_updated`) and shows a `success` toast: **"Updated property access for {email}"**.

### 2.5 Section D — Outstanding Invitations List (`GET /api/v1/owner/invitations`)

| Invite `status` (`V1_05`) | `<StatusBadge />` Variant & Label | Displayed Metadata (`Africa/Accra`) | Available Actions |
| :--- | :--- | :--- | :--- |
| **`PENDING`** | `variant="warning"` · `label="Pending Acceptance"` | `"Expires {expiresAt}"` + assigned property pills | *(Read-only in R1; expires automatically via sweep job)* |
| **`ACCEPTED`** | `variant="success"` · `label="Accepted"` | `"Accepted {acceptedAt}"` | Shown in Active Team Members list above |
| **`EXPIRED`** | `variant="error"` · `label="Expired"` | `"Expired {expiresAt}"` | Owner can click **`[Re-invite]`** (pre-fills Invite Staff modal with same email & properties) |
| **`REVOKED`** | `variant="info"` · `label="Revoked"` | `"Revoked"` | Owner can click **`[Re-invite]`** |

---

## 3. Screen 2: Staff Invite Acceptance (`SCR-08B` — `/owner/invitations/:token` & `/owner/invitations?token=...`)

Public/hybrid onboarding entry screen where an invited staff member previews their invitation, signs in or creates an account without losing the token, and accepts access (`GET /api/v1/invitations/{token}`, `POST /api/v1/invitations/{token}/accept`).

### 3.1 Responsive Layout (`360px` Mobile & Desktop)

Centered single-column onboarding card (`max-w-md mx-auto`, `bg-surface-card`, `border-border-subtle`, `rounded-xl`, `p-6`) on `bg-canvas` with the FindStay `BrandMark` header:

```text
+---------------------------------------------------+  <- 360px mobile (16px margin) / 448px max-w-md desktop
|                 [FindStay BrandMark]              |
|                                                   |
|  +---------------------------------------------+  |
|  |  [Building2 Icon]                           |  |
|  |  You've been invited to join                |  |
|  |  "{organizationDisplayName}"                |  |
|  |                                             |  |
|  |  Invited Email: staff@example.com           |  |
|  |  Role: [Staff Badge]                        |  |
|  |  Expires: 23 Nov 2026, 17:00 GMT            |  |
|  |                                             |  |
|  |  Assigned Properties:                       |  |
|  |  • Takoradi Harbour View Lodge              |  |
|  |  • Anaji Executive Apartments               |  |
|  |                                             |  |
|  |  -----------------------------------------  |  |
|  |  IF SIGNED IN (matching email):             |  |
|  |  [ Accept Invitation & Open Dashboard ]     |  |
|  |                                             |  |
|  |  IF SIGNED OUT:                             |  |
|  |  [ Sign In to Accept ]                      |  |
|  |  [ Create Account to Accept ]               |  |
|  +---------------------------------------------+  |
+---------------------------------------------------+
```

### 3.2 Authentication Handoff & Token Preservation

1. **Load Preview (`GET /api/v1/invitations/{token}`):**
   - Token-authorised endpoint; works whether the visitor is signed in or signed out.
   - Displays `organizationDisplayName`, `email`, `role` (`STAFF`), assigned property names (`properties: [{ id, name }]`), and `expiresAt` (`Africa/Accra`).
2. **If Visitor Is Signed Out:**
   - Primary CTA: **`[Create Account to Accept]`** → navigates to `/auth/sign-up?redirect=/owner/invitations/${token}&email=${encodeURIComponent(email)}`.
   - Secondary CTA: **`[Sign In to Accept]`** → navigates to `/auth/sign-in?redirect=/owner/invitations/${token}&email=${encodeURIComponent(email)}`.
   - Also stores `pending_invite_token` in `sessionStorage` so after Supabase email verification / sign-in callback (`/auth/callback`), the user is returned directly to `/owner/invitations/${token}`.
3. **If Visitor Is Signed In With a Different Email:**
   - Displays a `warning` banner: *"You are signed in as {currentUser.email}, but this invitation was sent to {invite.email}."* with a **`[Switch Account]`** button.
4. **If Visitor Is Signed In With the Invited Email:**
   - Primary CTA: **`[Accept Invitation & Open Dashboard]`** (`min-h-touch w-full bg-olive text-on-brand`).
   - Calls `POST /api/v1/invitations/{token}/accept` (`x-audit-event: org.staff_invite_accepted`).
   - On `200 OK`: clears `pending_invite_token`, refreshes `/api/v1/me` memberships, shows `success` toast (**"Welcome to {organizationDisplayName}!"**), and navigates to `/owner` scoped to their assigned properties (`[OrgScope]`).

### 3.3 Invite Token Error States (`SCR-08B`)

| API Response / Condition | Heading & Icon | User Message | CTA |
| :--- | :--- | :--- | :--- |
| **`404 NOT_FOUND`** (invalid token) | `XCircle` · `"Invitation Not Found"` | `"This invitation link is invalid or incomplete. Check the link in your email."` | `[Go to Homepage]` (`/`) |
| **`410 GONE` or `status === 'EXPIRED'`** | `AlertTriangle` · `"Invitation Expired"` | `"This invitation expired on {expiresAt}. Ask the property owner to send a new invitation."` | `[Go to Sign In]` (`/auth/sign-in`) |
| **`409 CONFLICT` or `status === 'REVOKED'`** | `XCircle` · `"Invitation No Longer Active"` | `"This invitation was revoked by the company owner."` | `[Go to Homepage]` (`/`) |
| **`status === 'ACCEPTED'`** | `CheckCircle2` · `"Invitation Already Accepted"` | `"This invitation has already been accepted. Sign in to access your properties."` | `[Go to Owner Portal]` (`/owner`) |

---

## 4. State Matrix (`S1-03-T5` Components)

| Screen / Section | Loading State (`Skeleton`) | Empty State (`EmptyState`) | Error / Validation State (`InlineError` / `Toast`) |
| :--- | :--- | :--- | :--- |
| **`SCR-08` Company Profile** | `<SkeletonCard />` while `GET /owner/org` loads | — (auto-created on onboarding in `S1-07-T3`) | `<InlineError />` per invalid field; `error` toast on `5xx`/network failure |
| **`SCR-08` Active Team Members** | `<SkeletonList count={2} />` | Only Primary Owner row shown; helper caption: *"Invite staff to help manage specific properties."* | `error` toast if `PATCH /owner/members/{id}` fails |
| **`SCR-08` Outstanding Invitations** | `<SkeletonList count={2} />` | `<EmptyState title="No pending invitations" description="Invite a manager or receptionist and choose which properties they can access." actionLabel="+ Invite Staff" />` | `409 CONFLICT` inline error on duplicate `PENDING` email: *"An active invitation already exists for this email."* |
| **`SCR-08B` Invite Acceptance** | Centered `<SkeletonCard />` (`aria-busy="true"`) | — | Token state cards (§3.3) or network error banner with `[Retry]` |
