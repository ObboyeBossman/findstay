# FindStay — Notification Bell Badge & Inbox Screen Specification (`S1-10-T1`)

- **Story:** [`S1-10`](../scrum/sprint-01/stories/S1-10/README.md) — Email, SMS & In-App Alerts
- **Traceability:** `FR-68`, `FR-69`, `FR-70`, `FR-71`, `NFR-07`, `NFR-60`
- **Frontend Target:** `S1-10-T6` (React Notification Bell & `/notifications` Inbox)
- **Viewport & Timezone:** `360px` mobile-first to `1440px`+ desktop · UTC stored, displayed in **`Africa/Accra`** (Ghana GMT)
- **Visual Tokens:** Strictly `web/src/theme/tokens.css` (`bg-surface-card`, `bg-surface-muted`, `border-border-subtle`, `bg-terracotta-dark`, `text-ivory`, `text-earth`, `bg-olive`, `min-h-touch`)

## 1. Notification Bell & Unread Badge (`AppLayout`, `OwnerLayout`, `AdminLayout`)

- Rendered in the persistent navigation rail for signed-in users holding `notification.read`.
- Touch target: `min-h-touch min-w-touch` (`44px × 44px`).
- Badge states:
  - `0` unread: badge hidden (`aria-label="Notifications"`).
  - `1–99` unread: terracotta pill (`bg-terracotta-dark text-ivory text-nano font-bold rounded-full`) showing exact count (`aria-label="Notifications (N unread)"`).
  - `100+` unread: compact `99+` label.
- Tapping navigates to `/notifications` (and keeps unread count synced with `GET /api/v1/me/notifications`).

## 2. Notification Inbox Screen (`/notifications`)

- **Header:** Title `"Notifications"`, unread summary badge (`<StatusBadge />`), and **`Mark all as read`** button (`POST /api/v1/me/notifications/read-all`, disabled when `unreadCount === 0`).
- **Filter Tabs:** `All` | `Unread` | `Channel Preferences`.
- **Notification Cards:**
  - Unread items use `bg-surface-card border-olive` with a visible `<StatusBadge variant="info" label="Unread" />` (never colour alone per `NFR-07`).
  - Read items use `bg-surface-muted/50 border-border-subtle`.
  - Each card displays title, body, event category, `Africa/Accra` timestamp, and a **`Mark as read`** button (`POST /api/v1/me/notifications/{id}/read`) when unread.
- **Channel Preferences Tab (`GET / PUT /api/v1/me/notifications/preferences`):**
  - Lists each Sprint 1 event type with accessible `IN_APP`, `EMAIL`, and `SMS` toggles (`min-h-touch`).
  - Displays a clear info notice when the platform SMS channel is in email/in-app fallback mode (`smsChannelActive === false`).
- **States:** `<SkeletonList />` loading, `<EmptyState title="You're all caught up" />`, and error state with **`Retry`**.
