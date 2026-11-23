# FindStay — Sprint 1 Planning & Team Assignment Roster

## 1. Team Members & GitHub Handles

| # | Name | Index Number | Role | GitHub Handle | Primary Track |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | **Joseph Osei-Bonsu** | BC/ITS/24/168 | Team Lead & Backend Developer | `@joseibonsu206-gif` | Track A (Backend & Identity) |
| 2 | **David Ofori** | BC/ITS/24/263 | Frontend Developer | `@KyleLion` | Track B (Frontend Shell & Catalog) |
| 3 | **Sampson Badu** | BC/ITS/24/161 | Payment & Integration Developer | `@badu12-png` | Track A (Notifications & Integrations) |
| 4 | **Seidu Afeadzi** | BC/ITS/24/152 | Backend Developer | `@seiduafeadzi` | Track A (Organisation & RBAC) |
| 5 | **Mashkura Tahiru** | BC/ITS/24/265 | Landlord Portal Developer | `@maskkuratahiru-wq` | Track B (Owner Portal, Verification & Listings) |
| 6 | **Bright Afedi** | BC/ITS/24/156 | Requirements & Analysis Lead | `@kwesipaa643-sys` | Track A/B (Requirements, Privacy & Admin) |
| 7 | **Emmanuel Rockson** | BC/ITN/24/153 | Database Designer | `@surnuel` | Track A/B (ERD, Schemas & Flyway `V1_01..V1_19`) |
| 8 | **Solomon Fummey** | BC/ITD/24/014 | Quality Assurance & Testing | `@fummey` | Track A/B (`@Req` Tests, UAT & Regression `R1`) |
| 9 | **Okyere Ankomah Julius** | BC/ITS/24/164 | UI/UX Designer | `@Ankomah959Julius` | Track B (Design System, Wireframes & Mobile 360px) |
| 10 | **Bossman Abraham N. O.** | BC/ITS/24/197 | System Architecture & Security | `@ObboyeBossman` | Track A (Platform, Cloud, R2, Security & Audit) |
| 11 | **Anthony Maclean** | BC/ITS/24/151 | Booking & Availability Specialist | `@dztrb` | Track B (Availability Calendar & Overlap Locks) |

---

## 2. Sprint 1 Backlog Assignments (`S1-01` – `S1-17`)

| Story | Title | Pri | Days | Lead & Collaborators |
| :--- | :--- | :-: | :-: | :--- |
| **S1-01** | Project setup & system design (Walking skeleton, CI & module boundaries) | M | D1–D3 | `@ObboyeBossman`, `@joseibonsu206-gif`, `@surnuel`, `@Ankomah959Julius`, `@kwesipaa643-sys` |
| **S1-02** | Live hosting & daily backups (Cloudflare, Render, Postgres backups & health) | M | D2–D4 | `@ObboyeBossman`, `@surnuel` |
| **S1-03** | Mobile & desktop page layouts (Design system & responsive portal shells) | M | D2–D5 | `@Ankomah959Julius`, `@KyleLion`, `@maskkuratahiru-wq` |
| **S1-04** | Sign-up, confirmation & sign-in (Supabase Auth & Spring JWKS validation) | M | D2–D5 | `@joseibonsu206-gif`, `@KyleLion` |
| **S1-05** | Password reset & user profile (`/api/v1/me` & recovery flow) | M | D5–D6 | `@joseibonsu206-gif`, `@KyleLion` |
| **S1-06** | Role permissions & safe access (Data-driven RBAC & security baseline) | M | D4–D6 | `@ObboyeBossman`, `@seiduafeadzi` |
| **S1-07** | Owner companies & staff access (Organisations, memberships & `OrgScope`) | M | D4–D7 | `@seiduafeadzi`, `@maskkuratahiru-wq`, `@surnuel` |
| **S1-08** | Permanent activity log (Append-only `audit_log` & admin viewer) | S | D5–D7 | `@ObboyeBossman`, `@surnuel` |
| **S1-09** | Photo & document uploads (Cloudflare R2 pre-signed URLs & WebP) | M | D4–D6 | `@ObboyeBossman`, `@KyleLion`, `@maskkuratahiru-wq` |
| **S1-10** | Email, SMS & in-app alerts (`NotificationSender`, templates & inbox) | M | D5–D7 | `@badu12-png`, `@joseibonsu206-gif` |
| **S1-11** | Privacy notice & user consent (Ghana Act 843 notice & `consent_record`) | S | D6–D7 | `@kwesipaa643-sys`, `@ObboyeBossman` |
| **S1-12** | Owner ID & property verification (Ghana Card AES-256 & GTA licence) | M | D6–D8 | `@maskkuratahiru-wq`, `@ObboyeBossman`, `@surnuel` |
| **S1-13** | Create properties, rooms & prices (Catalog CRUD, pesewa rates & `CatalogQuery`) | M | D4–D8 | `@maskkuratahiru-wq`, `@dztrb`, `@surnuel` |
| **S1-14** | Availability calendar & owner blocks (`availability_block` & `btree_gist`) | M | D7–D8 | `@dztrb`, `@surnuel`, `@maskkuratahiru-wq` |
| **S1-15** | Approval queue & publishing (Admin review decisions & status history) | M | D7–D8 | `@joseibonsu206-gif`, `@KyleLion`, `@kwesipaa643-sys` |
| **S1-16** | User management, platform settings & dashboard (`platform_setting` & admin) | S | D6–D8 | `@KyleLion`, `@seiduafeadzi`, `@kwesipaa643-sys` |
| **S1-17** | Stabilise, regression & release `R1` (End-to-end demo, UAT & release tag) | M | D9–D10 | `@fummey`, `@kwesipaa643-sys`, `@ObboyeBossman`, `@joseibonsu206-gif` |
