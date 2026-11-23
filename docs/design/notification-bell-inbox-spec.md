# Design Specification: Notification Bell Badge & Inbox Screen (`/notifications`)

- **Document ID:** `SPEC-S1-10-T1`
- **Parent Story:** `S1-10` — Email, SMS & In-App Alerts ([#10](https://github.com/ObboyeBossman/findstay/issues/10))
- **Related Task:** `S1-10-T1` ([#71](https://github.com/ObboyeBossman/findstay/issues/71))
- **Frontend Target:** `S1-10-T6` (React Notification Bell & Inbox UI)
- **Traceability:** `FR-68`, `FR-69`, `FR-70`, `FR-71`, `NFR-60`
- **Target Viewports:** 360px (mobile-first minimum width) to 1440px+ (desktop)
- **Timezone Standard:** Ghana Standard Time (`Africa/Accra`, GMT+0)

---

## 1. Executive Summary & Objective

This document defines the complete UI, UX, interaction, accessibility, and state specifications for FindStay's:
1. **Header Notification Bell Icon & Unread Count Badge** across both `OwnerLayout` (Owner Portal) and `AdminLayout` (Admin Portal).
2. **Notification Dropdown Preview** (Desktop & Tablet).
3. **Full Notification Inbox Screen (`/notifications`)** (Mobile 360px & Desktop).
4. **Interactive States:** Unread vs. Read visual indicators, Deep-Link Tap Behaviors, Loading Skeletons, Empty ("You're all caught up"), and Error/Retry states.

All visual styles rely strictly on Tailwind CSS design tokens, adhering to WCAG 2.1 AA accessibility and responsive layout guidelines without horizontal scroll at 360px width.

---

## 2. Header Notification Bell & Badge Specification

### 2.1 Placement & Accessibility
- **Location:** Embedded in the top header action cluster (right side, adjacent to User Profile Menu) in both `OwnerLayout` and `AdminLayout`.
- **Touch Target:** Minimum 44px × 44px hit-box (`p-2.5 rounded-full hover:bg-slate-100 transition-colors`).
- **Icon:** Lucide `Bell` (`w-5 h-5 text-slate-700`).
- **Screen Reader Attributes:**
  ```html
  <button
    type="button"
    aria-label="Notifications (3 unread)"
    aria-haspopup="true"
    aria-expanded="false"
    class="relative p-2.5 rounded-full hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
  >
    <svg class="w-5 h-5 text-slate-700" ...></svg>
    <!-- Badge -->
    <span class="sr-only">3 unread notifications</span>
  </button>
  ```

### 2.2 Unread Count Badge Variants

| State | Badge Appearance | Markup / Tailwind Tokens | Accessible Announcement |
| :--- | :--- | :--- | :--- |
| **0 Unread** | Hidden | `hidden` | `"Notifications"` |
| **1 – 99 Unread** | Red/Primary pill positioned top-right of bell (`top-1.5 right-1.5`). Displays exact number (e.g. `1`, `12`, `99`). | `absolute top-1.5 right-1.5 flex items-center justify-center px-1.5 min-w-[18px] h-[18px] text-[11px] font-bold text-white bg-rose-600 rounded-full border-2 border-white leading-none shadow-sm` | `"Notifications (X unread)"` |
| **100+ Unread** | Compact pill with `99+` label; does not clip or overflow container. | `px-1 min-w-[20px] text-[10px] font-bold text-white bg-rose-600 rounded-full border-2 border-white` | `"Notifications (more than 99 unread)"` |
| **New Alert Arrival** | Subtle pulse animation on arrival (`animate-ping` for 1 cycle). | `animate-ping duration-1000` | `aria-live="polite"` announces: *"New notification received"* |

---

## 3. Notification Dropdown Preview (Desktop / Tablet)

On viewports >= 640px (`sm:` breakpoint), clicking the bell toggles a floating popover anchored directly beneath the icon.

### 3.1 Dropdown Dimensions & Layout
- **Positioning:** `absolute right-0 mt-2 z-50`
- **Width:** `w-88 sm:w-96` (360px – 384px width).
- **Surface:** `bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden`.
- **Max Height:** `max-h-[480px] flex flex-col`.

### 3.2 Dropdown Structure

```text
+-----------------------------------------------------------+
| Notifications (3)                   [Mark all as read]    | <- Header (p-4 border-b border-slate-100)
+-----------------------------------------------------------+
| (*) [Shield] Verification Approved              10m ago  | <- Unread Item (bg-blue-50/50 border-l-4 border-blue-600)
|     Your owner verification documents have been approved. |
+-----------------------------------------------------------+
| ( ) [Home]   Listing Changes Requested           2h ago  | <- Read Item (bg-white border-l-4 border-transparent)
|     Notes: Missing bathroom photo.                        |
+-----------------------------------------------------------+
| (*) [Users]  Staff Invitation                   5h ago   |
|     You were invited to join Accra Stays Ltd.             |
+-----------------------------------------------------------+
| [           View all notifications in Inbox ->          ] | <- Footer (p-3 bg-slate-50 border-t border-slate-100 text-center)
+-----------------------------------------------------------+
```

### 3.3 Dropdown Interactions
1. **Header Action: "Mark all as read":**
   - Calls `POST /api/v1/me/notifications/read-all`.
   - Optimistically transitions all unread items in view to read and updates bell badge to 0.
2. **Item Click / Tap:**
   - Calls `POST /api/v1/me/notifications/{id}/read`.
   - Closes the dropdown.
   - Deep-links to the associated resource (see §5.3 Deep-Link Routing Matrix).
3. **Footer Action: "View all notifications":**
   - Navigates to `/notifications`.
   - Closes the dropdown.

---

## 4. Mobile 360px Layout Specification

On viewports < 640px (including strict 360px minimum width), screen real estate is constrained.

### 4.1 Mobile Header & Tap Behavior
- **No Floating Popovers:** Floating 380px popovers cause severe horizontal clipping and touch obstruction on 360px viewports.
- **Direct Navigation:** Tapping the Notification Bell on mobile transitions the user directly to the full `/notifications` Inbox route (or opens a slide-over mobile drawer).
- **Header Alignment:** Fits comfortably inside 360px headers alongside Hamburger Menu and FindStay Brand Logo.

### 4.2 360px Viewport Verification Specs
- **Horizontal Scroll Check:** Total page width strictly bounded to `100vw` (`overflow-x-hidden`).
- **Touch Spacing:** Notification cards use `p-3.5` with minimum 44px tap target heights.
- **Text Wrapping:** Titles and badges wrap cleanly without truncating essential context.

---

## 5. Full Notification Inbox (`/notifications`) Screen

The `/notifications` route is the central inbox for both Owner and Admin portals.

### 5.1 Page Header & Controls
- **Breadcrumb:** `Home > Notifications`
- **Page Title:** `Notifications` with count badge.
- **Filter Tabs:**
  - `All` (displays all alerts, paginated).
  - `Unread` (filters to `readAt === null`).
- **Global Actions:**
  - `[Mark all as read]` button (`variant="outline"`, disabled if `unreadCount === 0`).
  - `[Preferences]` button (opens modal / navigates to `/notifications/preferences`).

### 5.2 Notification Card Specification

```text
+----------------------------------------------------------------------------------+
| [*]  [Badge: Verification]                             23 Nov 2026, 14:30 GMT    |
|                                                                                  |
|      Verification Approved & Verified                                            |
|      Congratulations! Your owner verification documents have been approved.      |
|      Reviewer notes: Ghana Card and GTA license verified.                        |
|                                                                                  |
|      [ Review Documents -> ]                           [ Mark as read ]          |
+----------------------------------------------------------------------------------+
```

#### Card Styling Tokens:
- **Unread Card:**
  - Background: `bg-blue-50/60`
  - Border: `border border-blue-200 border-l-4 border-l-blue-600`
  - Unread Dot: `w-2 h-2 rounded-full bg-blue-600 inline-block mr-2`
  - Title Font: `font-semibold text-slate-900 text-base`
- **Read Card:**
  - Background: `bg-white`
  - Border: `border border-slate-200 border-l-4 border-l-transparent`
  - Title Font: `font-medium text-slate-700 text-base`
  - Body Font: `text-slate-600 text-sm leading-relaxed`

#### Event Category Badges:
| Event Category | Lucide Icon | Badge Tailwind Tokens |
| :--- | :--- | :--- |
| **Verification** (`VERIFICATION_*`) | `ShieldCheck` / `ShieldAlert` | `bg-amber-100 text-amber-800 border-amber-200` |
| **Listing** (`LISTING_*`) | `Home` | `bg-blue-100 text-blue-800 border-blue-200` |
| **Staff & Organisation** (`ORG_STAFF_*`) | `Users` | `bg-purple-100 text-purple-800 border-purple-200` |
| **Account & Security** (`USER_*`, `ACCOUNT_*`) | `AlertTriangle` / `CheckCircle` | `bg-rose-100 text-rose-800 border-rose-200` |

### 5.3 Deep-Link Routing Matrix

When a user taps an alert card or its primary action button, the client immediately marks the alert read and navigates:

| Event Type | Payload Key in `data` | Portal Target Route |
| :--- | :--- | :--- |
| `VERIFICATION_SUBMITTED` | `caseId` | Admin: `/admin/verification/{caseId}` |
| `VERIFICATION_APPROVED` | `caseId` | Owner: `/owner/verification` |
| `VERIFICATION_REJECTED` | `caseId`, `resubmitLink` | Owner: `/owner/verification/resubmit` |
| `LISTING_SUBMITTED` | `listingId` | Admin: `/admin/catalog/approvals/{listingId}` |
| `LISTING_APPROVED` | `listingId` | Owner: `/owner/listings/{listingId}` |
| `LISTING_CORRECTIONS_REQUESTED` | `listingId` | Owner: `/owner/listings/{listingId}/edit` |
| `LISTING_REJECTED` | `listingId` | Owner: `/owner/listings/{listingId}` |
| `ORG_STAFF_INVITED` | `invitationToken` | Public/Auth: `/invites/{invitationToken}` |
| `USER_SUSPENDED` / `RESTORED` | `userId` | User Profile: `/profile` |

### 5.4 Timestamps & Ghana Time (`Africa/Accra`) Standard
- Timestamps from API arrive in ISO-8601 UTC (`2026-11-23T14:30:00Z`).
- The UI formats dates using Ghana Standard Time (`GMT / UTC+0`):
  - **Relative (< 24 hours):** `Just now`, `5m ago`, `2h ago`.
  - **Absolute (>= 24 hours):** `22 Nov 2026, 14:30 GMT` (using `Intl.DateTimeFormat('en-GH', { timeZone: 'Africa/Accra' })`).

---

## 6. Component States (Loading, Empty & Error)

### 6.1 Loading State (Skeleton Screens)
- **Component:** Notification card skeletons matching actual row geometry.
- **Markup / Tokens:**
  ```html
  <div class="space-y-3">
    <!-- Skeleton card repeat x 4 -->
    <div class="p-4 bg-white border border-slate-200 rounded-xl animate-pulse space-y-3">
      <div class="flex items-center justify-between">
        <div class="h-5 w-24 bg-slate-200 rounded-full"></div>
        <div class="h-4 w-20 bg-slate-200 rounded"></div>
      </div>
      <div class="h-5 w-2/3 bg-slate-200 rounded"></div>
      <div class="h-4 w-full bg-slate-200 rounded"></div>
    </div>
  </div>
  ```

### 6.2 Empty State ("You're all caught up")
Displayed when `items.length === 0`:
- **Icon:** Lucide `BellOff` or `CheckCircle2` in a circular tinted wrapper (`w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto`).
- **Heading:** `"You're all caught up!"` (`font-bold text-slate-900 text-lg text-center mt-3`).
- **Description:** `"You have no unread notifications. Account, verification, and listing updates will appear here."` (`text-slate-600 text-sm text-center max-w-sm mx-auto mt-1`).
- **Primary CTA:** `"Return to Dashboard"` button linking back to `/owner` or `/admin`.

### 6.3 Error / Retry State
Displayed when the query fails (`isError === true`):
- **Icon:** Lucide `AlertCircle` (`w-12 h-12 text-rose-500 mx-auto`).
- **Heading:** `"Unable to load notifications"` (`font-bold text-slate-900 text-base text-center mt-2`).
- **Description:** `"We encountered a problem reaching the server. Please check your internet connection."`
- **Action CTA:** `"Try again"` button (`button variant="primary" onClick={() => refetch()}`).

---

## 7. Backend API Contract Alignment

The UI integrates with the canonical endpoints implemented in `S1-10-T5`:

```typescript
// TanStack Query Hooks definition

// 1. Fetch paginated inbox
export const useNotifications = (limit = 20, offset = 0) =>
  useQuery({
    queryKey: ['notifications', { limit, offset }],
    queryFn: () => api.get(`/api/v1/me/notifications?limit=${limit}&offset=${offset}`),
    refetchInterval: 30_000, // 30s background polling per Architecture §4.7
  });

// 2. Mark single notification read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/v1/me/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// 3. Mark all as read
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.post('/api/v1/me/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
```

---

## 8. Definition of Done & Sign-off

This specification satisfies all conditions of task `S1-10-T1`:
- [x] Bell icon, accessible labels, and 0 / 1–99 / 99+ count badges specified.
- [x] Bell dropdown preview and mobile 360px direct navigation behavior specified.
- [x] Full Inbox (`/notifications`) layouts, event category badges, and deep-link matrix specified.
- [x] Unread, read, loading skeletons, empty state, and error/retry states documented with exact Tailwind design tokens.
- [x] All endpoints align with `docs/design/backend-architecture.md §5`.
