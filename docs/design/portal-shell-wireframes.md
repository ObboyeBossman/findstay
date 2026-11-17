# FindStay — Owner & Admin Portal Shell Wireframes (`S1-03-T1`)

- **Task:** [`S1-03-T1`](../scrum/sprint-01/stories/S1-03/tasks/S1-03-T1.md)
- **Story:** [`S1-03`](../scrum/sprint-01/stories/S1-03/README.md) — Mobile & Desktop Page Layouts
- **Acceptance Criteria:** [`S1-03/acceptance-criteria.md`](../scrum/sprint-01/stories/S1-03/acceptance-criteria.md)
- **Color Palette:** [`color-palette.md`](./color-palette.md) (`Olive #55624A`, `Terracotta #BC6746`, `Sand #DCCB91`, `Ivory #F7F3EA`, `Earth #3E2F26`)
- **Typography:** [`typography.md`](./typography.md)

This specification defines the responsive shell wireframes for the **Owner Portal (`/owner/*`)** and **Admin Portal (`/admin/*`)**, mobile navigation drawer/bar patterns, and shared feedback state patterns (**Toast**, **Inline Error**, **Empty**, **Loading Skeleton**) for `360px` mobile, tablet, and desktop. It is the direct blueprint for **`S1-03-T3`**, **`S1-03-T4`**, and **`S1-03-T5`**.

---

## 1. Responsive Breakpoints & Zero-Overflow Rules

| Breakpoint | Width | Layout Shell | Horizontal Scroll |
| :--- | :--- | :--- | :---: |
| **Mobile (Small Phone)** | `360px – 767px` | Top Bar (`56px`) + Single-column Main (`16px` horizontal padding) + Sticky Bottom Nav (`64px`) + Slide-over Drawer for overflow items | **None (`0px`)** |
| **Tablet** | `768px – 1023px` | Top Bar (`64px`) + Collapsible Drawer (`240px` overlay or `72px` icon rail) + 2-column Main (`24px` padding) | **None (`0px`)** |
| **Desktop** | `1024px+` (content `max-w-6xl`) | Persistent Left Sidebar (`240px`) + Top Bar (`64px`) + Multi-column Main (`24px–32px` padding) | **None (`0px`)** |

**Core Accessibility & Layout Rules (`NFR-05`, `NFR-07`, `NFR-09`):**
- Every navigation link pairs a **20×20px Lucide icon + concise text label** (never icon-only without visible text on primary nav).
- Minimum touch target size on mobile: **`44×44px`**.
- Never rely on colour alone for active nav or status badges—combine border/underline/icon + text label.
- Tables on desktop (`Listings`, `Review Queue`, `Users`, `Audit Log`) collapse into **stacked cards** below `768px` so `360px` viewports never scroll horizontally.

---

## 2. Owner Portal Shell Wireframes (`/owner/*`)

Feeds **`S1-03-T3`**. Every `/owner/*` view operates within `[OrgScope]` (`organization_id`), shown clearly in the shell header/sidebar.

### 2A. Owner Mobile Shell (`360px × 800px`)

```text
+--------------------------------------+  <- 360px wide (0 horizontal overflow)
| [=] FindStay · [Org Name v]  (Bell)  |  <- 56px Top Bar (Olive #55624A / Ivory #F7F3EA)
+--------------------------------------+
| [!] Org Verification: Pending Review |  <- Optional global banner (icon + text)
+--------------------------------------+
|                                      |
|  Breadcrumb: Owner > Listings        |
|  Page Title (H1)        [+ Action]   |  <- Stacks below title if >160px wide
|                                      |
|  +--------------------------------+  |
|  | Main Content Area              |  |  <- Single-column cards (16px padding)
|  | (Dashboard / Listings /        |  |     min-height fills viewport above
|  |  Verification / Calendar)      |  |     bottom nav
|  +--------------------------------+  |
|                                      |
+--------------------------------------+
| [Home] [Listings] [Verify] [Cal] [More] | <- 64px Sticky Bottom Bar (icon + label)
+--------------------------------------+
```

**Owner Mobile Slide-Over Drawer** (opens from `[=]` or `[More]`):
- Active Organisation switcher (`[OrgScope]`)
- `Dashboard` (`/owner`)
- `Listings` (`/owner/listings`)
- `Verification` (`/owner/verification`)
- `Availability` (`/owner/calendar`)
- `Team & Staff` (`/owner/org`)
- `Profile & Alerts` (`/me`)
- `Switch to Guest Portal` (`/`)
- `Sign Out`

### 2B. Owner Tablet (`768px`) & Desktop (`1024px+`) Shell

```text
+--------------------+--------------------------------------------------+
| FINDSTAY  [Owner]  | Breadcrumb: Owner / Listings    (Bell) [User v]  | <- 64px Top Bar
+--------------------+--------------------------------------------------+
| Org: Acme Lodges   |                                                  |
| [Verified Badge]   |  Page Title + Primary CTA                        |
|                    |  +----------------------+ +--------------------+ |
| > [Home] Dashboard |  | Card / Section 1     | | Card / Section 2   | |
|   [List] Listings  |  +----------------------+ +--------------------+ |
|   [Shld] Verify    |                                                  |
|   [Cal]  Calendar  |  +--------------------------------------------+  |
|   [Team] Org/Staff |  | Main Table / Calendar / Form Content       |  |
|                    |  | (max-w-6xl, 24px–32px padding)             |  |
| ------------------ |  +--------------------------------------------+  |
|   [User] Profile   |                                                  |
|   [Swap] Guest View|                                                  |
|   [Exit] Sign Out  |                                                  |
+--------------------+--------------------------------------------------+
  ^ 240px Sidebar      ^ Fluid Main Content (Tablet: drawer toggles via [=])
```

---

## 3. Admin Portal Shell Wireframes (`/admin/*`)

Feeds **`S1-03-T4`**. Uses a clear **`Admin` role badge** in the header/sidebar so administrators never confuse `/admin` with `/owner` or `/`.

### 3A. Admin Mobile Shell (`360px × 800px`)

```text
+--------------------------------------+  <- 360px wide
| [=] FindStay  [ADMIN]        (Bell)  |  <- 56px Top Bar (Earth #3E2F26 / Ivory #F7F3EA)
+--------------------------------------+
|                                      |
|  Breadcrumb: Admin > Review Queue    |
|  Page Title (H1)                     |
|                                      |
|  +--------------------------------+  |
|  | Filter / Search Bar (full-wid) |  |
|  +--------------------------------+  |
|  +--------------------------------+  |
|  | Queue Card 1                   |  |  <- Stacked cards replace tables
|  | [Pending] Owner · Property     |  |     at <768px
|  | [Review ->]                    |  |
|  +--------------------------------+  |
|                                      |
+--------------------------------------+
| [Home]  [Queue (3)]  [Users]  [More] |  <- 64px Sticky Bottom Bar (icon + label + badge)
+--------------------------------------+
```

**Admin Mobile Slide-Over Drawer** (opens from `[=]` or `[More]`):
- `Dashboard` (`/admin`)
- `Review Queue` (`/admin/reviews` — with numeric pending badge)
- `Users` (`/admin/users`)
- `Platform Settings` (`/admin/settings`)
- `Audit Log` (`/admin/audit`)
- `Profile` (`/me`)
- `Sign Out`

### 3B. Admin Tablet (`768px`) & Desktop (`1024px+`) Shell

```text
+--------------------+--------------------------------------------------+
| FINDSTAY  [ADMIN]  | Breadcrumb: Admin / Review Queue  (Bell) [Admin v]| <- 64px Top Bar
+--------------------+--------------------------------------------------+
|                    |                                                  |
|   [Home] Dashboard |  KPI Summary Row (4 cols desktop / 2 cols tablet)|
| > [Chk]  Queue (3) |  +--------+ +--------+ +--------+ +--------+    |
|   [Usr]  Users     |  |Pending | |Listings| |Users   | |Alerts  |    |
|   [Gear] Settings  |  +--------+ +--------+ +--------+ +--------+    |
|   [Log]  Audit Log |                                                  |
|                    |  +--------------------------------------------+  |
| ------------------ |  | Filterable Queue / Users / Audit Table     |  |
|   [User] Profile   |  +--------------------------------------------+  |
|   [Exit] Sign Out  |                                                  |
+--------------------+--------------------------------------------------+
  ^ 240px Sidebar      ^ Fluid Main Content (Tablet: collapsible drawer)
```

---

## 4. Shared State Patterns (`S1-03-T5` Blueprint)

Every screen in `/owner/*` and `/admin/*` uses these four standardized state components:

### 4A. Toast Alerts (`role="status"` / `role="alert"`)
- **Placement:** Top-center full-width (`16px` margin) on `360px` mobile; top-right (`max-w-sm`) on tablet/desktop.
- **Structure:** `[Status Icon] + [Short Title & 1-line message] + [Optional Action e.g. Retry] + [Dismiss X]`.
- **Variants (Icon + Border + High-Contrast Text):**
  - `Success`: Olive `#55624A` border + CheckCircle icon
  - `Info`: Earth `#3E2F26` border + Info icon
  - `Warning`: Sand/Earth border + AlertTriangle icon
  - `Error`: Terracotta `#BC6746` / high-contrast red-earth border + XCircle icon

### 4B. Inline Form Errors
- **Placement:** Directly below the invalid input (`4px` gap), linked via `aria-describedby` and `aria-invalid="true"`.
- **Structure:** `[AlertCircle Icon] + [Plain-language fix instruction, e.g. "Enter a price greater than GH₵ 0"]`.

### 4C. Empty States
- **Placement:** Centered inside the main content card/table container.
- **Structure:**
  ```text
  +----------------------------------------+
  |            [Muted Icon 40px]           |
  |        Plain-Language Heading          |
  |   1-line explanation of what shows     |
  |   here once items exist.               |
  |          [ + Primary CTA ]             |
  +----------------------------------------+
  ```
- **Examples:** `"No properties yet"` (`[+ Add Property]`), `"All caught up — no pending reviews"`, `"No matching users found"` (`[Clear Filters]`).

### 4D. Loading / Skeleton States (`NFR-03`)
- **Rule:** Match the final layout geometry (cards on mobile, table rows on desktop) with `aria-busy="true"` and `aria-label="Loading..."`.
- **Styling:** Warm `Sand/30` (`#DCCB91` at 30% opacity) pulsing blocks on `Ivory` (`#F7F3EA`) canvas—never blank white screens or unlabelled spinners for page loads.
