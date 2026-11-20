# FindStay — Sprint 1 Demo & Test Evidence Log (`R1`)

This file tracks the verification status, automated `@Req` test evidence, and Sprint Review demo proof for all 17 Sprint 1 stories (`S1-01` to `S1-17`).

| Story | Title | Priority | Status | Evidence / PR / Test Reference |
| :--- | :--- | :---: | :---: | :--- |
| **S1-01** | Project setup & system design | M | `Done` | All 16 tasks (`T1`–`T16`) closed/Done: clean `web/` & `api/` structure (`6711648`), ERD/API spec, 35 Sprint 1 wireframe exports (`35f5f32`, issue #28 closed), Flyway `V1_01`–`V1_13`, CI & Testcontainers, and staging proof (`#53`). Issue #1 closed. |
| **S1-02** | Live hosting & daily backups | M | `Done` | Cloudflare Workers static frontend live (`200 OK`), Render Spring Boot API live (`UP`), automated backups & restore guide ([`database-backup-and-restore.md`](../operations/database-backup-and-restore.md)), Day 4 restore drill passed in 38.6s ([`s1-02-restore-drill.md`](./s1-02-restore-drill.md)), secret scan clean (0 leaks, [`s1-02-secret-scan.md`](./s1-02-secret-scan.md)), and uptime monitor active ([`uptime-monitor.yml`](../../.github/workflows/uptime-monitor.yml)). Issue #2 closed. |
| **S1-03** | Mobile & desktop page layouts | M | `In Progress` | T1–T5 complete: portal-shell wireframes (`08fa286`), tokens, Owner/Admin/Guest persistent sidebar shells (mobile `w-16` / desktop `w-24`), and shared UI states merged to `dev`; `npm run lint:theme`, `typecheck`, and `build` pass. T6 cross-browser 360px check and T7 accessibility/3G smoke test remain. |
| **S1-04** | Sign-up, confirmation & sign-in | M | `Done` | All 7 tasks (`T1`–`T7`) verified Done: Supabase Auth + Resend SMTP + 6-digit OTP templates, Spring JWKS validation (`SecurityJwtValidationTest` 5/5), `/api/v1/me` provisioning (`IdentityProvisioningIntegrationTest` 6/6), React auth screens + Turnstile (`PR #59`, `PR #60`), live `401` JWT rejection probes, and clean browser-bundle key scan ([`s1-04-t7-auth-verification.md`](./s1-04-t7-auth-verification.md)). Issue #4 closed. |
| **S1-05** | Password reset & user profile | M | `In Progress` | 3-stage 6-digit OTP forgot-password flow (`ForgotPasswordPage.tsx`, PR #59) built; field-level rules on `GET/PATCH /api/v1/me`, My Profile page, and tests remain. |
| **S1-06** | Role permissions & safe access | M | `Backlog` | Pending `@RequiresPermission` & RBAC matrix tests. |
| **S1-07** | Owner companies & staff access | M | `Backlog` | Pending cross-organisation `OrgScope` isolation tests. |
| **S1-08** | Permanent activity log | S | `Backlog` | Pending append-only `audit_log` DB constraint test. |
| **S1-09** | Photo & document uploads | M | `Backlog` | Pending Cloudflare R2 pre-signed URL & WebP tests. |
| **S1-10** | Email, SMS & in-app alerts | M | `Backlog` | Pending `NotificationSender` adapter & retry tests. |
| **S1-11** | Privacy notice & user consent | S | `Backlog` | Pending Act 843 `consent_record` verification. |
| **S1-12** | Owner ID & property verification | M | `Backlog` | Pending AES-256 Ghana Card encryption & review tests. |
| **S1-13** | Create properties, rooms & prices | M | `Backlog` | Pending catalog validation & `CatalogQuery` seam tests. |
| **S1-14** | Availability calendar & owner blocks | M | `Backlog` | Pending concurrent `btree_gist` overlap exclusion test. |
| **S1-15** | Approval queue & publishing | M | `Backlog` | Pending admin approval & audit trail tests. |
| **S1-16** | User management, platform settings & dashboard | S | `Backlog` | Pending user suspension & `platform_setting` tests. |
| **S1-17** | Stabilise, regression & release `R1` | M | `Backlog` | Pending full 7-step Sprint 1 demo walkthrough & `v0.1.0-R1` tag. |
