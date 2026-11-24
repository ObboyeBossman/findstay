# S1-09: Photo & Document Uploads

**Details:** Priority: Must | Track B | Days 4–6  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- React uploads directly to Cloudflare R2 via Spring Boot pre-signed URLs without proxying file bytes through the API.
- Approved property photos are served from the public bucket as optimised WebP; verification documents stay private behind expiring signed URLs.
- Oversized (>5 MB) or wrong-type files are rejected, and users can only upload to their own paths.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-09-T1`](./tasks/S1-09-T1.md) | Design Photo Uploader & Document Uploader components | `ui-ux` | [`S1-03-T5`](../S1-03/tasks/S1-03-T5.md) | UI/UX Design | `@surnuel` | Done |
| [`S1-09-T2`](./tasks/S1-09-T2.md) | Provision Cloudflare R2 buckets & path-isolation policies | `devops` | [`S1-02-T4`](../S1-02/tasks/S1-02-T4.md) | Architecture, Cloud & Security | `@surnuel` | Done |
| [`S1-09-T3`](./tasks/S1-09-T3.md) | Create media.media_asset & media.document tables | `database` | [`S1-07-T2`](../S1-07/tasks/S1-07-T2.md) | Database & Data |  | Todo |
| [`S1-09-T4`](./tasks/S1-09-T4.md) | Build pre-signed R2 upload URL API & WebP public promotion | `backend` | [`S1-09-T2`](./tasks/S1-09-T2.md), [`S1-09-T3`](./tasks/S1-09-T3.md), [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md) | Backend Development |  | Todo |
| [`S1-09-T5`](./tasks/S1-09-T5.md) | Build temporary expiring signed-URL endpoint for private docs | `backend` | [`S1-09-T2`](./tasks/S1-09-T2.md), [`S1-09-T3`](./tasks/S1-09-T3.md), [`S1-06-T2`](../S1-06/tasks/S1-06-T2.md) | Backend Development |  | Todo |
| [`S1-09-T6`](./tasks/S1-09-T6.md) | Build React Photo & Document Uploaders with client-side WebP & 5 MB checks | `frontend` | [`S1-09-T1`](./tasks/S1-09-T1.md), [`S1-09-T4`](./tasks/S1-09-T4.md), [`S1-09-T5`](./tasks/S1-09-T5.md) | Frontend Development |  | Todo |
| [`S1-09-T7`](./tasks/S1-09-T7.md) | Test storage isolation, file rejection, signed-URL expiry & throttled payload | `testing` | [`S1-09-T4`](./tasks/S1-09-T4.md), [`S1-09-T5`](./tasks/S1-09-T5.md), [`S1-09-T6`](./tasks/S1-09-T6.md) | QA & Testing |  | Todo |
