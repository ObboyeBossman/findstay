# FindStay — Accommodation Marketplace & Property Management Platform

> 🚀 **Live Production Website:** [https://dist-eight-sooty-42.vercel.app](https://dist-eight-sooty-42.vercel.app)

FindStay is a production-grade, two-sided accommodation marketplace and Property Management System (PMS) architected as a modular monorepo. It serves travelers, tourists, corporate business executives, and tertiary students across Ghana (initial pilot: Sekondi-Takoradi Metropolitan Area).

---

## 🏛️ Monorepo Directory Architecture

```text
findstay/
├── apps/                                  # Independent frontends & PWAs
│   ├── site/                              # findstay.com — Public marketing website (Home, About, Policies, FAQ) [Port 3000]
│   ├── guest/                             # app.findstay.com — Student & Guest Booking PWA (Mobile installable) [Port 3001]
│   ├── owner/                             # host.findstay.com — Landlord & Hotelier PMS Operations PWA [Port 3002]
│   └── admin/                             # admin.findstay.com — Governance & Ghana Act 843 Compliance Portal [Port 3003]
├── packages/                              # Shared monorepo packages
│   ├── types/                             # @findstay/types — Shared TypeScript interfaces (Unit, Property, Booking)
│   └── ui/                                # @findstay/ui — Shared Tailwind UI components (Badges, Status, Modals)
├── services/                              # Backend services
│   └── api/                               # Java 17 / Spring Boot 3.2.3 REST API (CORS, Pessimistic Lock, JJWT)
├── database/                              # PostgreSQL 15+ database layer
│   ├── schema.sql                         # 3NF relational schema (7 tables, ENUMs, composite indexes)
│   └── seed.sql                           # Takoradi seed data (Hotels, Apartments, Guesthouses, Hostels)
├── docs/                                  # Academic documentation & presentation deliverables
│   ├── pdf/                               # Full 5-chapter report and team role allocation PDFs
│   ├── presentation/                      # 13-slide PowerPoint defense deck with embedded speaker notes
│   └── research/                          # 13 technical blueprints and chapter drafts
├── package.json                           # Root monorepo workspace configuration
└── README.md                              # This file
```

---

## 📱 Progressive Web App (PWA) Capabilities

The guest and host portals are built as **installable Progressive Web Apps (PWAs)**:

- **Mobile First for Ghana:** Over 85% of tertiary students and hostel caretakers in Takoradi access services via mobile phones.
- **Add to Home Screen:** Users can install FindStay directly from Chrome/Safari with a native app icon, splash screen, and full-screen mode without app store downloads.
- **Offline Caching:** Static assets and previously viewed accommodations are cached locally via `public/sw.js`. Live reservations and Mobile Money payments remain strictly online to prevent stale double-bookings.

---

## 🌐 Subdomain & Portal Roles

| Domain / Portal | Workspace | Target Audience | Primary Capabilities |
| :--- | :--- | :--- | :--- |
| **`findstay.com`** | `apps/site` | General Public, Visitors, Parents | Public marketing website, Takoradi neighborhood guides, 3-step walkthrough, About Us, Terms of Service, Privacy Policy, and Refund FAQs. |
| **`app.findstay.com`** | `apps/guest` | Students & Short-Stay Guests | PWA booking app. Search hotels, apartments, guesthouses, hostels. 15-minute concurrency hold timer (`SELECT ... FOR UPDATE`), MTN/Telecel MoMo STK push simulation. |
| **`host.findstay.com`** | `apps/owner` | Hoteliers, Landlords, Caretakers | PWA Property Management System (PMS). Real-time room occupancy grid (Available, Booked, Held, Cleaning), check-in tracker, automated MoMo payout history. |
| **`admin.findstay.com`** | `apps/admin` | Platform Governance | Landlord Ghana Card KYC verification queue, 36-booking break-even financial sustainability tracker, and immutable Ghana Act 843 audit trail. |
| **`api.findstay.com`** | `services/api` | Central REST API | Java 17 Spring Boot REST API with BCrypt hashing, JJWT authentication, subdomain-aware CORS filter, and pessimistic concurrency locks. |

---

## 🚀 Running the Monorepo Locally

### 1. Install Workspace Dependencies
From the repository root:
```bash
npm install
```

### 2. Run All Applications Concurrently
```bash
npm run dev
```
This runs all 4 frontends concurrently:
- **Public Website (`apps/site`):** [http://localhost:3000](http://localhost:3000)
- **Guest Booking PWA (`apps/guest`):** [http://localhost:3001](http://localhost:3001)
- **Host PMS PWA (`apps/owner`):** [http://localhost:3002](http://localhost:3002)
- **Admin Console (`apps/admin`):** [http://localhost:3003](http://localhost:3003)

You can also run any portal individually:
```bash
npm run dev:site     # Port 3000
npm run dev:guest    # Port 3001
npm run dev:owner    # Port 3002
npm run dev:admin    # Port 3003
```

### 3. Verify Production Builds
```bash
npm run build
```
Builds all 4 applications and shared packages into optimized production bundles.

---

## 👥 Student Team Roles (11 Members)

| # | Name | Index Number | Assigned Project Role |
| :---: | :--- | :--- | :--- |
| 1 | **Joseph Osei-Bonsu** | BC/ITS/24/168 | Team Lead & Backend Developer |
| 2 | **David Ofori** | BC/ITS/24/263 | Frontend Developer |
| 3 | **Sampson Badu** | BC/ITS/24/161 | Payment Integration (Mobile Money) |
| 4 | **Seidu Afeadzi** | BC/ITS/24/152 | Backend Developer |
| 5 | **Mashkura Tahiru** | BC/ITS/24/265 | Landlord Portal Developer |
| 6 | **Bright Afedi** | BC/ITS/24/156 | Requirements & Analysis Lead |
| 7 | **Emmanuel Rockson** | BC/ITN/24/153 | Database Designer |
| 8 | **Solomon Fummey** | BC/ITD/24/014 | Quality Assurance & Testing |
| 9 | **Okyere Ankomah Julius** | BC/ITS/24/164 | UI/UX Designer |
| 10 | **Bossman Abraham N. O.** | BC/ITS/24/197 | System Architecture & Security |
| 11 | **Anthony Maclean** | BC/ITS/24/151 | Booking Engine Specialist |

---

## 🌿 Git Branches & Remote

The repository is synchronized with GitHub:
- `main` — Production monorepo release
- `feature/backend-auth` — Auth, JJWT & RBAC (Joseph & Seidu)
- `feature/booking-engine` — Pessimistic locking & 15-minute hold engine (Anthony)
- `feature/paystack-momo` — Mobile Money STK Push & Webhook Verification (Sampson)
- `feature/property-portal` — Landlord listing & PMS management (Mashkura)
- `feature/frontend-ui` — Responsive UI & PWA components (David)
