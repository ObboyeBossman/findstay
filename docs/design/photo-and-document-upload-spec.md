# Photo Uploader & Document Uploader Design Spec (`S1-09-T1`)

- **Story:** `S1-09` (Photo & Document Uploads)
- **Screens:** `SCR-12` (Photo Management) and `SCR-09` (Owner Verification Upload)
- **Design System:** All visual properties strictly use `web/src/theme/tokens.css` via Tailwind utilities (`docs/rules/design-system-and-theming.md`).

---

## 1. `PhotoUploader` Component (Property Photos — `PUBLIC_IMAGES`)

### Layout & Affordances
- **Dropzone:** Dashed border (`border-dashed border-border-default bg-surface-muted/40`), minimum touch target `min-h-touch`, tap-to-browse on mobile and drag-and-drop on desktop.
- **Limits banner:** Displays `Up to 10 photos · Max 5 MB each · Optimised to WebP automatically for fast 3G loading`.
- **Upload progress:** Per-file progress bar (`bg-olive`) with stage label (`Optimising to WebP…` → `Uploading directly to storage…` → `Ready`).
- **Grid:** 2 columns on mobile (`grid-cols-2`), 4 columns on desktop (`lg:grid-cols-4`), zero horizontal overflow at 360px.
- **Card actions:**
  - **Cover badge:** First or chosen cover photo displays a Terracotta/Olive `Cover` badge.
  - **Set as cover:** Promotes selected photo to cover position.
  - **Reorder (`←` / `→`):** Accessible button controls to move photos left/right without requiring pointer-only drag.
  - **Remove:** Soft-deletes the asset via `DELETE /api/v1/owner/media/{assetId}`.

### Early Validation & Error States
- Files exceeding `5 MB` (`5,242,880` bytes) are blocked immediately before conversion/upload with an inline `InlineError` message stating the actual file size and 5 MB limit.
- Unsupported MIME types (anything outside `image/jpeg`, `image/png`, `image/webp`) are rejected immediately with a clear format hint.
- Attempting to exceed 10 photos disables the dropzone and explains the cap.

---

## 2. `DocumentUploader` Component (Verification Documents — `PRIVATE_DOCS`)

### Layout & Affordances
- **Purpose:** Used in `SCR-09` (Ghana Card, proof of ownership, GTA licence) for strictly private uploads.
- **Privacy badge:** Displays lock icon + `Private — Encrypted & accessible only via expiring links`.
- **Accepted types:** `PDF`, `JPEG`, `PNG`, `WebP` up to `5 MB`.
- **States:**
  1. **Empty:** Single-card dropzone with clear document title and description.
  2. **Uploading:** Progress bar (`0%–100%`) directly to Cloudflare R2 pre-signed PUT URL.
  3. **Uploaded (`READY`):** Shows filename/type, size, `Private` badge, **Preview (5-min secure link)** button (calls `GET /api/v1/media/{assetId}/signed-url`), and **Replace** button.
  4. **Error:** Inline validation or upload failure message with immediate retry.
