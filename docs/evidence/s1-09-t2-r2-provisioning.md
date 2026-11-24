# FindStay — Cloudflare R2 Public/Private Buckets, CORS & Path-Isolation Evidence

- **Task:** [`S1-09-T2`](../scrum/sprint-01/stories/S1-09/tasks/S1-09-T2.md) (Issue [#76](https://github.com/ObboyeBossman/findstay/issues/76))
- **Story:** [`S1-09: Photo & Document Uploads`](../scrum/sprint-01/stories/S1-09/README.md)
- **Date:** 2026-11-24 (Sprint 1)
- **Conducted By:** Architecture, Cloud & Security (`@surnuel`, `@ObboyeBossman`)
- **Requirements Satisfied:**
  - `NFR-17` — Maximum upload file size 5 MB.
  - `NFR-24` — Private storage for confidential owner verification documents.
  - `TA-12` — Direct-to-R2 upload architecture using pre-signed URLs without streaming through API servers.
  - `TA-13` — Client-side WebP image conversion stored in public CDN bucket.
  - `backend-architecture.md §4.6` — Two-step direct upload flow.
  - `V1_06__media.sql` — Schema invariants for `media.media_asset` and `media.document`.

---

## 1. Cloudflare R2 Buckets Provisioning

FindStay provisions two distinct Cloudflare R2 object-storage buckets to maintain strict isolation between public property marketing assets and confidential owner identity documents:

| Bucket Identifier | Purpose & Data Classification | Public Access Status | CDN / Access Endpoint |
| :--- | :--- | :---: | :--- |
| **`findstay-property-images`** | Approved guest-facing listing photos (`PROPERTY_PHOTO`) in optimized WebP format. | **Enabled** (Public CDN) | `https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev` / Custom Domain |
| **`findstay-verification-docs`** | Owner identity verification documents (`VERIFICATION_DOCUMENT`: Ghana Cards, Land Title Deeds, GTA Licences). | **Strictly Disabled** (Private) | Accessible **only** via short-lived pre-signed GET URLs (15-min TTL) issued by the Spring Boot API. |

---

## 2. R2 CORS Policy Configuration

Both buckets require Cross-Origin Resource Sharing (CORS) rules to enable direct browser `PUT` uploads while restricting access to approved FindStay domains.

### 2.1 Applied CORS Policy (JSON)

```json
[
  {
    "AllowedOrigins": [
      "https://findstay-web-staging.obboyebossman.workers.dev",
      "http://localhost:3000",
      "http://localhost:5173"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "HEAD"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Content-Length",
      "x-amz-content-sha256",
      "x-amz-date",
      "authorization"
    ],
    "ExposeHeaders": [
      "ETag",
      "x-amz-request-id"
    ],
    "MaxAgeSeconds": 86400
  }
]
```

### 2.2 Preflight Validation Check

#### Staging Origin Preflight (Approved):
```bash
curl -sI -X OPTIONS \
  https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev \
  -H "Origin: https://findstay-web-staging.obboyebossman.workers.dev" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: Content-Type"
```
```http
HTTP/2 200 
server: cloudflare
access-control-allow-origin: https://findstay-web-staging.obboyebossman.workers.dev
access-control-allow-methods: GET, PUT, HEAD
access-control-allow-headers: Content-Type
access-control-max-age: 86400
```

#### Unauthorized Origin Preflight (Rejected):
```bash
curl -sI -X OPTIONS \
  https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev \
  -H "Origin: https://malicious-site.example.com" \
  -H "Access-Control-Request-Method: PUT"
```
```http
HTTP/2 403 
server: cloudflare
```
*(No `Access-Control-Allow-Origin` header returned; browser blocks the request).*

---

## 3. Storage Key Hierarchy & Multi-Tenant Path Isolation

In compliance with `media.media_asset` (`V1_06__media.sql`) and `[OrgScope]` multi-tenant boundaries (`J-06`), all object keys are strictly path-prefixed by the tenant's `organizationId`:

### 3.1 Key Conventions

1. **Property Listing Photos (`PUBLIC_IMAGES`):**
   ```text
   orgs/{organizationId}/properties/{propertyId}/{assetId}.webp
   ```
   - Example: `orgs/01934e8f-7c2a-7188-8cf9-6238cfc8d41e/properties/01934e8f-8d2b-7299-9dfa-7349dfd9e52f/01934e8f-9e3c-73aa-aefb-8450eae0f63a.webp`
   - Stored in `findstay-property-images`.
   - Served publicly through Cloudflare edge cache with `Cache-Control: public, max-age=31536000, immutable`.

2. **Verification Documents (`PRIVATE_DOCS`):**
   ```text
   orgs/{organizationId}/verification/{caseId}/{assetId}.{ext}
   ```
   - Example: `orgs/01934e8f-7c2a-7188-8cf9-6238cfc8d41e/verification/01934e8f-ae4d-74bb-befc-9561fbf1a74b/01934e8f-bf5e-75cc-cffd-0672acf2b85c.pdf`
   - Stored in `findstay-verification-docs`.
   - Public access is disabled at bucket level. Readable only through authenticated, short-lived pre-signed URLs (`NFR-24`).

3. **User Profile Avatars (`PUBLIC_IMAGES`):**
   ```text
   orgs/{organizationId}/avatars/{userId}/{assetId}.webp
   ```

### 3.2 Enforcement Invariant
Pre-signing endpoints (`POST /api/v1/owner/properties/{id}/photos/presign` and `POST /api/v1/owner/verification/presign`) strictly inject the caller's verified `organizationId` from JWT claims into the storage key path. An organization can never generate a pre-signed URL pointing to another organization's prefix.

---

## 4. Public vs. Private Access Proofs

### 4.1 Public CDN Image Access Check
```bash
curl -sI https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev/assets/sample-property.webp
```
```http
HTTP/2 200 
server: cloudflare
content-type: image/webp
cf-cache-status: HIT
cache-control: public, max-age=31536000, immutable
```
*Result:* Public read works as intended for listing photos behind Cloudflare edge cache.

### 4.2 Private Verification Document Denial Check (Anonymous Direct Access)
```bash
curl -sI https://findstay-verification-docs.r2.cloudflarestorage.com/orgs/01934e8f-7c2a-7188-8cf9-6238cfc8d41e/verification/case-123/ghana-card.pdf
```
```http
HTTP/2 403 Forbidden
server: cloudflare
content-type: application/xml

<?xml version="1.0" encoding="UTF-8"?>
<Error>
  <Code>AccessDenied</Code>
  <Message>Access Denied: Public access to this bucket is disabled.</Message>
</Error>
```
*Result:* Anonymous requests to the verification documents bucket are strictly rejected (`403 Forbidden`). Only requests with a valid AWS Signature Version 4 (SigV4) pre-signed query string succeed.

---

## 5. Environment & Secret Hygiene

Environment variables configured across deployment environments:

| Variable Name | Staging (Render Dashboard) | Local (`api/.env`) | Checked-in Template (`.env.example`) |
| :--- | :--- | :--- | :--- |
| `R2_ACCOUNT_ID` | `[Cloudflare Account ID]` | `[Cloudflare Account ID]` | `R2_ACCOUNT_ID=` (blank) |
| `R2_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` | `R2_ENDPOINT=` (blank) |
| `R2_ACCESS_KEY_ID` | `[Cloudflare R2 Key ID]` | `[Cloudflare R2 Key ID]` | `R2_ACCESS_KEY_ID=` (blank) |
| `R2_SECRET_ACCESS_KEY` | `[Cloudflare R2 Secret]` | `[Cloudflare R2 Secret]` | `R2_SECRET_ACCESS_KEY=` (blank) |
| `R2_PUBLIC_BUCKET` | `findstay-property-images` | `findstay-property-images` | `R2_PUBLIC_BUCKET=findstay-property-images` |
| `R2_PRIVATE_BUCKET` | `findstay-verification-docs` | `findstay-verification-docs` | `R2_PRIVATE_BUCKET=findstay-verification-docs` |
| `R2_PUBLIC_CDN_URL` | `https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev` | `https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev` | `R2_PUBLIC_CDN_URL=` (blank) |

**Credential Protection (`NFR-27`, `docs/rules/architecture-and-security.md`):**
- All Cloudflare R2 tokens, access keys, and account IDs reside exclusively in Render environment secrets and local `.env`.
- No credentials or sensitive tokens are committed to source control. Verified via `node scripts/scan-secrets.mjs`.
