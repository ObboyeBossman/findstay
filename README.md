# FindStay — Student Accommodation & Property Management Platform

FindStay is a production-grade web accommodation marketplace and property management platform designed specifically for university tertiary students and private hostel managers in Ghana (initial pilot: Takoradi / TTU & Takoradi residential hubs including Anaji, Effia, Beach Road, and Westline).

---

## 🏛️ Project Directory Structure

```text
findstay/
├── docs/                                  # All project documentation and defense assets
│   ├── pdf/
│   │   ├── findstay-project-documentation.pdf  # 29-page complete 5-chapter academic report
│   │   └── findstay-team-roles.pdf             # 2-page student role allocation & sign-off sheet
│   ├── presentation/
│   │   └── findstay-presentation.pptx          # 13-slide defense PowerPoint with speaker notes
│   └── research/                               # Detailed research drafts & technical blueprints
│       ├── FindStay_Chapter_1_Synthesized_Draft.md
│       ├── FindStay_Chapter_2_Synthesized_Draft.md
│       ├── FindStay_Chapter_3_Synthesized_Draft.md
│       ├── FindStay_Chapter_4_Synthesized_Draft.md
│       ├── FindStay_Chapter_5_Synthesized_Draft.md
│       ├── FindStay_Security_Architecture_and_Controls.md
│       ├── FindStay_Revenue_Model_and_Financial_Sustainability.md
│       └── FindStay_Team_Roles_and_Responsibilities.md
├── database/                              # Database layer (PostgreSQL 15+)
│   ├── schema.sql                         # 3NF relational schema (7 tables, ENUMs, composite indexes)
│   └── seed.sql                           # Real-world Takoradi hostels, rooms, and test accounts
├── backend/                               # Core REST API (Java 17 / Spring Boot 3.2.3)
│   ├── pom.xml                            # Maven dependencies (JPA, Security, JJWT, PostgreSQL)
│   └── src/main/
│       ├── java/com/findstay/             # Domain models, repositories, controllers, CORS config
│       └── resources/application.yml      # Subdomain CORS origins, DB config, Paystack settings
└── frontend/                              # Multi-Portal Web Client (React 18 + Vite + Tailwind CSS)
    ├── src/
    │   ├── router/SubdomainRouter.tsx     # Subdomain detection & local portal switcher
    │   └── portals/
    │       ├── guest/                     # app.findstay.com (Student Booking Portal)
    │       ├── landlord/                  # host.findstay.com (Hostel Landlord Management)
    │       └── admin/                     # admin.findstay.com (Platform Governance & Compliance)
    ├── package.json
    └── vite.config.ts
```

---

## 🌐 Subdomain Architecture

FindStay routes traffic into dedicated portals based on the incoming subdomain:

| Domain / Subdomain | Target Audience | Primary Features |
| :--- | :--- | :--- |
| **`app.findstay.com`** | Tertiary Students & Guests | Takoradi neighborhood search, verified hostel badges, room type filters, 15-minute reservation hold timer, and MTN/Telecel/AirtelTigo Mobile Money checkout. |
| **`host.findstay.com`** | Hostel Landlords & Managers | Real-time room occupancy grid, self-contain & shared room inventory management, pending 15-min reservation tracker, and MoMo payout ledger. |
| **`admin.findstay.com`** | Platform Operations & Security | Landlord Ghana Card verification queue, 36-booking break-even revenue tracker, and Ghana Data Protection Act (Act 843) audit logs. |
| **`api.findstay.com`** | Central Backend API | Java Spring Boot REST API, BCrypt auth, pessimistic row-level locking (`SELECT ... FOR UPDATE`), and Paystack HMAC-SHA512 webhook ingestion. |

---

## 🚀 Running the Project Locally

### 1. Frontend Multi-Portal (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173). 
> **Presentation Tip:** In local development, the interactive **Subdomain Switcher** at the top of the screen allows you to seamlessly toggle between the **Guest Portal**, **Landlord Portal**, and **Admin Portal** with one click.

To verify a production build:
```bash
npm run build
```

### 2. Database (PostgreSQL)
Execute the SQL scripts against your PostgreSQL 15+ database instance:
```bash
psql -U postgres -d findstay -f database/schema.sql
psql -U postgres -d findstay -f database/seed.sql
```

### 3. Backend (Java Spring Boot)
The backend is located in `backend/` and targets Java 17+ and Spring Boot 3.2.3:
```bash
cd backend
mvn spring-boot:run
```
The REST API will start on port `8080` with subdomain-aware CORS pre-configured.

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

## 🌿 Git Feature Branches

Feature branches have been published to `origin` for collaborative development:
- `feature/backend-auth` — User authentication, JWT tokens, and RBAC (Joseph & Seidu)
- `feature/booking-engine` — Pessimistic lock `SELECT ... FOR UPDATE` & 15-min hold timer (Anthony)
- `feature/paystack-momo` — Mobile Money STK Push & Webhook Verification (Sampson)
- `feature/property-portal` — Landlord listing & room management portal (Mashkura)
- `feature/frontend-ui` — Student marketplace & responsive UI components (David)
