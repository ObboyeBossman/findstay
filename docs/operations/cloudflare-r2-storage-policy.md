# Cloudflare R2 Storage & Path-Isolation Policy (`S1-09-T2`)

- **Story:** `S1-09` (Photo & Document Uploads)
- **Requirements:** `NFR-17`, `TA-12`, `TA-13`

## 1. Bucket Architecture

| Logical Bucket (`media.media_asset.bucket`) | Cloudflare R2 Bucket Name | Access Level | Caching & Delivery |
| :--- | :--- | :--- | :--- |
| `PUBLIC_IMAGES` | `findstay-property-images` | Public read via CDN (`R2_PUBLIC_CDN_URL`); writes strictly via pre-signed PUT | Immutable WebP objects cached at Cloudflare edge (`Cache-Control: public, max-age=31536000, immutable`) |
| `PRIVATE_DOCS` | `findstay-verification-docs` | **Strictly private** — public access disabled, no custom public domain | Short-lived SigV4 pre-signed GET URLs (default **300 seconds / 5 minutes**) issued only to the owning organisation or `ADMIN` (`media.private.read`) |

## 2. Server-Enforced Path Isolation

Clients never choose the bucket or storage key. `MediaService` generates every key from the JWT-derived `organizationId` (`OrgScope`):

- **Property photos (staged):** `orgs/{organizationId}/photos/{propertyId}/{assetId}.{ext}`
- **Property photos (promoted public WebP):** `orgs/{organizationId}/public/properties/{propertyId}/{assetId}.webp`
- **User avatars:** `orgs/{organizationId}/avatars/{userId}/{assetId}.{ext}`
- **Verification documents (private):** `orgs/{organizationId}/verification/{ownerId}/{assetId}.{ext}`

## 3. Direct-to-R2 CORS Policy (Required on Both Buckets)

Configure CORS on `findstay-property-images` and `findstay-verification-docs` in Cloudflare R2 so browsers upload directly without proxying bytes through the Render API:

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://findstay-web-staging.obboyebossman.workers.dev"
    ],
    "AllowedMethods": ["PUT", "GET", "HEAD"],
    "AllowedHeaders": ["Content-Type", "Content-Length"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. Environment Configuration & Local/CI Fallback

Set the following variables on Render (`api/.env.example`):

- `R2_ENDPOINT`: `https://<account-id>.r2.cloudflarestorage.com`
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`: Scoped R2 API token (Object Read & Write on the two buckets only)
- `R2_PUBLIC_BUCKET`: `findstay-property-images`
- `R2_PRIVATE_BUCKET`: `findstay-verification-docs`
- `R2_PUBLIC_CDN_URL`: Public R2/CDN origin for approved WebP photos
- `R2_PRESIGN_UPLOAD_TTL_SECONDS`: `600` (10 minutes)
- `R2_PRESIGN_DOWNLOAD_TTL_SECONDS`: `300` (5 minutes)

When `R2_ENDPOINT` is blank (local development and Testcontainers CI), `StorageUrlSigner` automatically falls back to `LocalStubStorageUrlSigner` so tests exercise full metadata validation, path isolation, and signed-URL expiry without requiring live cloud credentials.
