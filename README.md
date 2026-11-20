# FindStay

> **Ghana-focused accommodation marketplace and property-management system for guests, property owners/staff, and platform administrators.**

FindStay brings local verification, Mobile Money workflows, protected bookings, and property-management tools together into a unified, mobile-friendly platform.

---

## Quick Links

- 📂 **[Folder Structure & Repository Guide](./docs/folder-structure.md)** — Comprehensive breakdown of every directory, module, and architecture layer.
- 📖 **[Product Overview & Vision](./docs/overview.md)** — Problem statement, delivery phases, and target personas.
- 📐 **[Sprint 1 Wireframes Specification](./docs/design/wireframes/findstay-wireframes.md)** — UI/UX wireframe inventory, mobile/desktop layouts, and element specs.
- 🗄️ **[Database ERD Specification](./docs/design/erd.md)** — Complete 34-table Sprint 1 schema documentation.
- ⚙️ **[Backend API Guide](./api/README.md)** — Java 21 / Spring Boot 3 modular monolith, Flyway migrations, and test harness.
- 🌐 **[Web Application Guide](./web/AGENTS.md)** — React 18 + TypeScript + Vite multi-portal frontend architecture.

---

## Repository Architecture

```text
findstay/
├── api/          # Java 21 / Spring Boot 3 modular monolith (Spring Modulith & Flyway)
├── web/          # React 18 / TypeScript / Vite / Tailwind multi-portal web app
├── docs/         # Living documentation (requirements, architecture, scrum, design)
├── showcase/     # Standalone Vite site for sprint demos and presentations
├── scripts/      # Automation utilities for GitHub project synchronization
├── .agents/      # Workflow tooling and engineering guidelines
└── .github/      # Continuous Integration (CI) workflows
```

For full details on subdirectories, package boundaries, and domain modules, see **[docs/folder-structure.md](./docs/folder-structure.md)**.

---

## Quickstart & Useful Commands

Run from the repository root:

```bash
# Install frontend workspace dependencies
npm install

# Typecheck web application
npm run typecheck

# Build web application for production
npm run build

# Build progress showcase presentation site
npm run build:showcase

# Run backend test suite (Spring Modulith boundary checks & Flyway on Testcontainers)
(cd api && mvn test)

# Sync GitHub project board progress
npm run sync:project
```

---

## Core Invariants & Rules

1. **API-First Data Access:** Supabase handles Auth only. All application data flows through `/api/v1/*` via Spring REST APIs with JWKS token validation.
2. **Organization Isolation:** Multi-tenancy is enforced on every owner-facing query and mutation via `OrgScope`.
3. **Financial Precision:** Currency values are stored as 64-bit integer pesewas (`bigint`) with `GHS` currency code.
4. **Timezone Normalization:** Database timestamps are strictly stored in UTC (`timestamptz`) and converted to `Africa/Accra` only at presentation boundaries.
5. **Tamper-Proof Audit:** Audit logs in `audit.audit_log` are append-only (`INSERT` and `SELECT` only).
