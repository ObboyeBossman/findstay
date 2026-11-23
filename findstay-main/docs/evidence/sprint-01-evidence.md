# FindStay — Sprint 1 Demo & Test Evidence Log (`R1`)

This file tracks the verification status, automated `@Req` test evidence, and Sprint Review demo proof for all 17 Sprint 1 stories (`S1-01` to `S1-17`).

| Story | Title | Priority | Status | Evidence / PR / Test Reference |
| :--- | :--- | :---: | :---: | :--- |
| **S1-01** | Project setup & system design | M | `In Progress` | Clean `web/` & `api/` structure initialized (`6711648`); system design (ERD, API spec, Wireframes) in progress. |
| **S1-02** | Live hosting & daily backups | M | `Ready` | Pending Cloudflare Workers, Render & PostgreSQL backup drill. |
| **S1-03** | Mobile & desktop page layouts | M | `Ready` | Pending 360px mobile & desktop portal layout shells. |
| **S1-04** | Sign-up, confirmation & sign-in | M | `Ready` | Pending Supabase Auth + Spring JWKS integration tests. |
| **S1-05** | Password reset & user profile | M | `Backlog` | Pending `/api/v1/me` and password reset flow. |
| **S1-06** | Role permissions & safe access | M | `Backlog` | Pending `@RequiresPermission` & RBAC matrix tests. |
| **S1-07** | Owner companies & staff access | M | `Backlog` | Pending cross-organisation `OrgScope` isolation tests. |
| **S1-08** | Permanent activity log | S | `Backlog` | Pending append-only `audit_log` DB constraint test. |
| **S1-09** | Photo & document uploads | M | `Backlog` | Pending Cloudflare R2 pre-signed URL & WebP tests. |
| **S1-10** | Email, SMS & in-app alerts | M | `In Progress` | `S1-10-T5` inbox, mark-as-read & preferences endpoints exposed (`/api/v1/me/notifications*`); `@Req` unit & integration tests completed. |
| **S1-11** | Privacy notice & user consent | S | `Backlog` | Pending Act 843 `consent_record` verification. |
| **S1-12** | Owner ID & property verification | M | `Backlog` | Pending AES-256 Ghana Card encryption & review tests. |
| **S1-13** | Create properties, rooms & prices | M | `Backlog` | Pending catalog validation & `CatalogQuery` seam tests. |
| **S1-14** | Availability calendar & owner blocks | M | `Backlog` | Pending concurrent `btree_gist` overlap exclusion test. |
| **S1-15** | Approval queue & publishing | M | `Backlog` | Pending admin approval & audit trail tests. |
| **S1-16** | User management, platform settings & dashboard | S | `Backlog` | Pending user suspension & `platform_setting` tests. |
| **S1-17** | Stabilise, regression & release `R1` | M | `Backlog` | Pending full 7-step Sprint 1 demo walkthrough & `v0.1.0-R1` tag. |
