# FindStay — Repository & Folder Structure Guide

> **Project:** FindStay (Ghana Accommodation Marketplace & Property Management System)  
> **Architecture Style:** Modular Monorepo (React Frontend + Spring Modulith Backend + Living Documentation)  
> **Source of Truth:** [`docs/overview.md`](./overview.md) · [`AGENTS.md`](../AGENTS.md)

---

## 1. High-Level Workspace Overview

FindStay is organized into four core functional areas alongside infrastructure, developer skills, and CI automation:

```text
findstay/
├── api/          # Backend: Java 21 / Spring Boot 3 modular monolith (Spring Modulith)
├── web/          # Frontend: React 18 / TypeScript / Vite / Tailwind multi-portal web app
├── docs/         # Living Documentation: Architecture, specifications, scrum tracking, design & evidence
├── showcase/     # Progress Showcase: Standalone Vite presentation site for sprint demos
├── scripts/      # Automation: GitHub project sync and metric rollup utilities
├── .agents/      # Agent Skills: Custom workflow tooling and engineering guidelines
├── .github/      # CI/CD: Automated workflows for builds, tests, and task tracking
├── AGENTS.md     # Canonical system guidelines & platform invariant rules
└── package.json  # Root npm scripts for multi-workspace orchestration
```

---

## 2. Directory Tree Map

```text
findstay/
├── .agents/
│   └── skills/
│       ├── agile-scrum-kanban/        # Agile lifecycle and Kanban references
│       ├── findstay-scrum/            # Project backlog & scrum assignment tooling
│       ├── findstay-story-delivery/   # Story implementation and PR workflow skills
│       ├── git-file-checkpoint/       # Safe checkpointing helpers
│       ├── sprint-retro/              # Retrospective templates & rubrics
│       └── team-rules/                # Engineering boundaries & standards
├── .github/
│   └── workflows/
│       ├── ci.yml                     # Full CI pipeline (build, test, Modulith check, flyway)
│       └── issue-completion-rollup.yml# Task issue synchronization workflow
├── api/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/findstay/
│   │   │   │   ├── admin/             # Platform settings, verification review & audits
│   │   │   │   ├── audit/             # Append-only tamper-proof audit trail
│   │   │   │   ├── availability/      # Unit availability calendars & date-block exclusions
│   │   │   │   ├── identity/          # Accounts, profiles, and platform RBAC
│   │   │   │   ├── listing/           # Properties, units, pricing tiers, amenities, photos
│   │   │   │   ├── media/             # Cloudflare R2 asset metadata & presigned URL registry
│   │   │   │   ├── notification/      # Notifications inbox, templates, preferences, delivery
│   │   │   │   ├── organization/      # Owner company spaces, staff memberships, invitations
│   │   │   │   ├── shared/            # Cross-cutting security (JWKS), base entities, OrgScope
│   │   │   │   └── verification/      # Owner KYC cases, Ghana Card & GTA licence verification
│   │   │   └── resources/
│   │   │       ├── application.yml    # Spring Boot environment & module configuration
│   │   │       └── db/migration/      # Flyway idempotent SQL migration scripts (V1_01 - V1_13)
│   │   └── test/java/com/findstay/    # Testcontainers PostgreSQL tests, @Req tag enforcement
│   ├── AGENTS.md                      # Backend modular rules & boundary guidelines
│   ├── pom.xml                        # Maven dependencies & build configuration
│   └── README.md                      # API setup, Flyway lifecycle & integration test guide
├── docs/
│   ├── decisions/                     # Architecture Decision Records (ADRs: DEC-S1-*)
│   ├── design/                        # Visual design tokens, ERD, user flows & wireframes
│   │   ├── assets/                    # Supporting imagery
│   │   ├── wireframes/                # Sprint 1 wireframes (HTML, PDF, MD, and 35 PNG exports)
│   │   ├── backend-architecture.md    # C4 backend component specification
│   │   ├── color-palette.md           # Accessible brand color palette
│   │   ├── erd.md                     # Complete database entity-relationship documentation
│   │   ├── portal-shell-wireframes.md # Mobile & desktop responsive shell specs
│   │   ├── typography.md              # Typographic scale & tokens
│   │   └── user-flows.md              # Screen-to-screen user journeys (SCR-01 - SCR-ERR)
│   ├── diagrams/                      # Architecture, sequence, and component diagrams
│   ├── evidence/                      # Verification proof, staging test evidence & receipts
│   ├── meeting-notes/                 # Sprint kickoff, planning, and backlog refinement records
│   ├── pdf/                           # Formal reference documents and role definitions
│   ├── presentation/                  # Slide decks and sprint showcase materials
│   ├── requirements/                  # Functional (FR) and non-functional (NFR) requirements
│   ├── research/                      # Market study, competitive analysis & compliance research
│   ├── rules/                         # Non-negotiable architectural, security, & module rules
│   ├── scrum/                         # Sprint documentation, stories (S1-01..S1-16) & task cards
│   ├── team/                          # Team member profiles, assigned tasks & progress logs
│   ├── testing/                       # Acceptance test walkthroughs, staging smoke tests
│   ├── AGENTS.md                      # Documentation governance rules
│   └── overview.md                    # Product vision, problem definition & delivery roadmap
├── scripts/
│   ├── issue-completion-rollup.mjs    # Synchronizes GitHub issues into sprint markdown logs
│   └── sync-project.mjs               # GitHub Project board automated cache syncer
├── showcase/
│   ├── assets/ & public/              # Presentation assets and interactive HTML showcase
│   ├── index.html                     # Showcase homepage entry point
│   ├── package.json                   # Showcase workspace configuration
│   └── vite.config.ts                 # Showcase bundler configuration
├── web/
│   ├── src/
│   │   ├── components/                # Shared layout & reusable UI components
│   │   │   ├── ui/                    # Primitives: Toast, FormField, EmptyState, Skeleton
│   │   │   ├── AppLayout.tsx          # Root shell component
│   │   │   ├── BrandMark.tsx          # FindStay logo & branding badge
│   │   │   ├── PortalShell.tsx        # Responsive Owner & Admin dashboard shell with drawer
│   │   │   └── StatusBadge.tsx        # Accessible status chip (icon + label, NFR-07)
│   │   ├── features/                  # Domain-specific UI features (mirrors backend modules)
│   │   │   ├── admin/                 # Administrator verification & moderation UI
│   │   │   ├── audit/                 # Audit trail views
│   │   │   ├── availability/          # Unit calendar management & date blockers
│   │   │   ├── identity/              # Sign in, registration, password reset
│   │   │   ├── listing/               # Listing creation wizard, photo upload, preview
│   │   │   ├── media/                 # Photo manager & cover selectors
│   │   │   ├── notification/          # Inbox and communication toggles
│   │   │   ├── organization/          # Staff invitations & team setup
│   │   │   └── verification/          # Owner document upload & status tracker
│   │   ├── layouts/                   # Nested route layouts: AdminLayout, OwnerLayout
│   │   ├── lib/                       # Low-level clients: api.ts (REST client), supabase.ts (Auth)
│   │   └── pages/                     # Routed pages: GuestHomePage, OwnerAreaPage, etc.
│   ├── AGENTS.md                      # Frontend architecture rules & API convention guide
│   ├── index.html                     # Web entry HTML
│   ├── package.json                   # Web dependencies (React, TypeScript, Tailwind)
│   ├── tailwind.config.js             # Design tokens, color system, and breakpoints
│   └── vite.config.ts                 # Vite dev server & production bundler configuration
├── .gitignore                         # Version control exclusions
├── AGENTS.md                          # Global repository instruction set & non-negotiables
├── CLAUDE.md                          # Quick agent entry point
├── package.json                       # Root script orchestrator (`typecheck`, `build`, etc.)
└── package-lock.json                  # Deterministic dependency lockfile
```

---

## 3. Deep Dive into Major Components

### 3.1 Backend Application (`api/`)
- **Technology Stack:** Java 21, Spring Boot 3.3+, Spring Modulith, PostgreSQL 16+, Flyway, Testcontainers.
- **Architectural Pattern:** Modular Monolith. Each business domain (`identity`, `listing`, `availability`, etc.) is structured as an isolated Spring Modulith module.
- **Cross-Module Rules:** Modules communicate strictly through public Java API contracts or asynchronous domain events. Direct cross-package access to internal entities or repositories is forbidden and enforced during builds via Spring Modulith verification tests.
- **Tenant Isolation (`OrgScope`):** Every owner-facing query or command is strictly scoped to the caller's organization ID.
- **Database Migrations (`src/main/resources/db/migration/`):**
  - Schema evolution is managed exclusively by numbered, immutable Flyway SQL files (`V1_01` to `V1_13`).
  - Implements the tamper-proof `findstay_app` group role (preventing `UPDATE` or `DELETE` on the `audit.audit_log` table).
- **Automated Verification:**
  - Uses Testcontainers to run integration tests against a real, throwaway PostgreSQL instance.
  - Tests enforce requirement tracing using the custom `@Req("ID")` annotation.

### 3.2 Frontend Application (`web/`)
- **Technology Stack:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Portals & Routing:**
  - **Guest Portal (`/`):** Public accommodation browsing, destination search (`SCR-22`, `SCR-23`, `SCR-24`), and property detail view (`SCR-25`).
  - **Owner / Staff Portal (`/owner/*`):** Dashboard (`SCR-07`), property management (`SCR-11`, `SCR-14`), multi-unit rates (`SCR-11B`), calendar availability (`SCR-15`), photo management (`SCR-12`), and verification KYC (`SCR-09`).
  - **Admin Portal (`/admin/*`):** Verification review queue (`SCR-19`, `SCR-20`), user administration (`SCR-21A`), platform settings (`SCR-21B`), and immutable audit logs (`SCR-21C`).
- **Feature Organization (`src/features/`):** Mirrors the modular backend domains 1:1, ensuring clear feature ownership and preventing sprawling component trees.
- **Accessibility & Tokens:** Adheres to WCAG 2.1 AA contrast standards; status chips never rely on color alone (`StatusBadge.tsx` combines icons + text labels).

### 3.3 Living Documentation (`docs/`)
- The `docs/` tree is the **single source of truth** for all project requirements, architectural decisions, and verification records.
- **`decisions/`:** Formal Architecture Decision Records (ADRs) capturing rationale for technical choices (e.g. Supabase Auth, Flyway seed strategy, R2 storage).
- **`design/`:** High-fidelity documentation including the Database ERD (`erd.md`), User Flow Journeys (`user-flows.md`), and the complete Sprint 1 Wireframes collection (`wireframes/`).
- **`scrum/`:** Sprint planning, user stories (`S1-01` through `S1-16`), and individual task markdown files containing acceptance criteria and completion checklists.
- **`rules/`:** Governing architectural and security constraints that must be observed on every commit.

### 3.4 Progress Showcase (`showcase/`)
- A dedicated, lightweight Vite site used to compile and demonstrate sprint deliverables, interactive wireframe mockups, and stakeholder presentations independently from the production web application.

### 3.5 Automation & Skills (`scripts/` & `.agents/`)
- **`scripts/`:** Node.js utilities that read the live GitHub Project board (`sync-project.mjs`) and roll up issue progress into markdown evidence files.
- **`.agents/skills/`:** Reusable agent skill instructions supporting standardized task delivery, agile metrics, git checkpoints, and sprint retrospectives.

---

## 4. Key Architectural Invariants

| Invariant | Implementation Rule |
| :--- | :--- |
| **Authentication vs. Business Data** | Supabase is used strictly for Auth (issuing JWTs). All business data flows through the Spring REST API at `/api/v1/*` which validates JWTs via JWKS. |
| **Financial Representation** | All currency values are stored as 64-bit integer pesewas (`bigint`) with `currency = 'GHS'` to prevent floating-point inaccuracies. |
| **Timezone Normalization** | All database timestamps are persisted in UTC (`timestamptz`). Formatting for `Africa/Accra` occurs exclusively at UI presentation boundaries. |
| **Tamper-Proof Audit Trail** | The `audit.audit_log` table allows `INSERT` and `SELECT` only; database role grants strictly disallow updates and deletions. |
| **Branching Strategy** | Development occurs on `dev`; releases merge to `staging` and `main`. Protected branches require pull requests and automated CI passing checks. |

---

## 5. Standard Developer Workflow Commands

Run all commands from the repository root:

```bash
# Typecheck web application
npm run typecheck

# Build web application for production
npm run build

# Build progress showcase site
npm run build:showcase

# Run API test suite (Spring Modulith check, Flyway migrations, Testcontainers)
(cd api && mvn test)

# Sync GitHub project board progress
npm run sync:project
```
