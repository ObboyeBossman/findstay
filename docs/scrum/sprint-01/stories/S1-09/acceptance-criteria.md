# S1-09: Acceptance Criteria

- **Story:** [S1-09: Photo & Document Uploads](./README.md)
- **Who this helps:** Property owners uploading listing photos and private verification documents
- **Priority:** Must have | **Track:** Track B | **Days:** D4–D6
- **Summary:** Let owners upload property photos directly to Cloudflare R2 (optimised to WebP) while keeping identity and property documents private.
- **Screens involved:** Photo Uploader component and Document Uploader component in the Owner Portal
- **Database tables:** media.media_asset, media.document (owner_type, owner_id, storage_key)
- **System actions:** Pre-signed R2 upload URLs, metadata checks, WebP promotion to public bucket, signed URLs for private docs

## What Proves This Story Is Finished

1. React uploads directly to Cloudflare R2 via Spring Boot pre-signed URLs without proxying file bytes through the API.
2. Approved property photos are served from the public bucket as optimised WebP; verification documents stay private behind expiring signed URLs.
3. Oversized (>5 MB) or wrong-type files are rejected, and users can only upload to their own paths.

## Linked Requirements

- **Non-Functional:** [`NFR-17`](../../../../requirements/non-functional/non-functional-requirements.md)
- **Technical:** [`TA-12`](../../../../requirements/technical/technical-requirements.md), [`TA-13`](../../../../requirements/technical/technical-requirements.md)
