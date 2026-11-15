# FindStay — Team Roles & Detailed Duties

This guide lists every duty and standard task for each role on FindStay. If you are assigned a role on a story or backlog item, follow the checklist for that role from start to finish.

**Task Tags:** `requirements` · `ui-ux` · `frontend` · `backend` · `database` · `devops` · `testing` · `lead-scrum`

---

## 1. Product & Requirements
- **Story Clarity:** Write or refine user stories in plain English so everyone understands what is being built and why.
- **Acceptance Criteria:** Write clear `Given / When / Then` or pass/fail acceptance criteria for every story before work begins.
- **Requirement Traceability:** List all linked requirement IDs (`FR-*`, `NFR-*`, `SEC-*`, `BRL-*`, `CON-*`, `UI-*`) and their priority (`Must`, `Should`, `Could`).
- **Stakeholder Decisions:** Confirm open decisions (`J-*`, `P-*`) or document an agreed fallback before the story enters the sprint.
- **Scope & Priority:** Enforce the `Must` → `Should` → `Could` priority order and verify that the story fits within 1–3 days of work.
- **Review & Sign-off:** Verify the completed feature against the acceptance criteria during Sprint Review.

---

## 2. UI/UX Design
- **User Flows:** Map out step-by-step user journeys (happy path, error states, empty states, and loading states).
- **Wireframes & Mockups:** Create clear wireframes or screen designs for every page and modal in the story.
- **Mobile-First Layout:** Design for mobile screens first (`360px`+) and ensure layouts scale cleanly to tablet and desktop.
- **Design System Consistency:** Reuse shared colors, typography, spacing, buttons, and form patterns across all portals (`guest`, `owner`, `admin`).
- **Accessibility:** Ensure readable contrast, clear labels, keyboard navigation, and accessible error messages.
- **Developer Handoff:** Share final designs with Frontend developers and review the implemented UI before it is marked Done.

---

## 3. Frontend Development
- **Project & Folder Structure:** Build features inside the Vite + React + Tailwind app, keeping one feature folder per backend module.
- **Routing & Navigation:** Implement routes and navigation guards for `guest`, `owner`, and `admin` portals.
- **UI Implementation:** Match the UI/UX wireframes accurately, including mobile (`360px`+) and desktop responsiveness.
- **Forms & Validation:** Add client-side validation, clear inline error messages, loading spinners, and disabled states to prevent double submits.
- **API Integration:** Connect to backend endpoints via the API client—never access FindStay business tables directly.
- **Feature Flags:** Wrap unfinished or `Could` features behind `platform_setting` feature flags when required.
- **Code Quality:** Ensure zero TypeScript/ESLint warnings, clean PRs, and frontend tests passing before merging.

---

## 4. Backend Development
- **Module & API Design:** Build endpoints in Spring Boot 3 (JDK 21) following Spring Modulith boundaries (no importing another module's internals).
- **OpenAPI Contracts:** Keep OpenAPI documentation up to date for every module endpoint.
- **Business Logic & Domain Events:** Implement core rules, shared kernel standards (money in pesewas, UTC `timestamptz` rendered in Ghana time, standard error model), and domain events.
- **Security & Isolation:** Enforce endpoint authorization, `OrgScope` tenant isolation, input validation, and `AuditRecorder` logging.
- **Integrations & Notifications:** Implement payment, SMS, email, and webhook integrations with proper retries, idempotency, and fallbacks.
- **Code Quality:** Ensure zero compiler/linter warnings and `ApplicationModules.verify()` passes before merging.

---

## 5. Database & Data
- **ERD & Schema Design:** Design and review the Entity-Relationship Diagram (ERD) against the eight module seams.
- **Schema-per-Module:** Keep each module's tables in its own PostgreSQL schema with required extensions (e.g., `btree_gist`).
- **Flyway Migrations:** Write strictly additive Flyway migrations using the sprint's reserved version range (`V1_01`–`V1_19` for Sprint 1).
- **Data Integrity:** Define primary keys, foreign keys, unique constraints, indexes, and check constraints.
- **Upgrade & Restore Safety:** Verify that migrations upgrade cleanly from the previous release snapshot without breaking existing data.

---

## 6. Architecture, Cloud & Security (DevOps)
- **Module Boundaries:** Enforce `ApplicationModules.verify()` in CI so no illegal cross-module dependencies are merged.
- **CI/CD Pipelines:** Maintain automated build, test, and deployment workflows on GitHub Actions.
- **Hosting & Environments:** Manage staging and production infrastructure (Cloudflare Workers, Render, Supabase) and verify health checks.
- **Secrets & Access Control:** Manage environment variables, API keys, RBAC rules, and database/storage access safely.
- **Backup & Recovery:** Run backup/restore drills before release and monitor logs and uptime.

---

## 7. QA & Testing (including UAT)
- **Test Harness:** Maintain the Testcontainers PostgreSQL test harness and ensure all tests use `@Req("...")` annotations.
- **Unit & Integration Tests:** Write and verify tests covering every acceptance criterion (happy path, edge cases, and failure cases).
- **Regression Testing:** Run the cumulative regression suite (`R1`..`Rn`) in CI and block merges if any test fails.
- **Cross-Browser & Mobile Checks:** Test the live staging UI on mobile (`360px`+) and desktop viewports.
- **User Acceptance Testing (UAT):** Prepare UAT test scripts, coordinate UAT on staging, and log any bugs before Sprint Review.

---

## 8. Scrum & Delivery Management
- **Sprint Planning:** Ensure stories meet the Definition of Ready before entering the sprint and are sized for 1–3 days.
- **Progress Tracking:** Keep story statuses, member boards, and `docs/team/` records up to date.
- **Blocker Removal:** Spot and resolve blockers early (e.g., Day 2 infrastructure gate, Day 3 foundation gate).
- **Feature Freeze & Release:** Enforce Day 8 feature freeze, ensure unfinished stories are flagged off, and run the Sprint Review demo.

## 9. Team Lead
- **Conduct Meetings:** Lead technical syncs, design reviews, and team check-ins to keep everyone aligned.
- **Finalise Decisions:** Make the final call on technical approaches, trade-offs, and open team decisions when consensus is needed.
- **Represent the Team:** Act as the main point of contact for the team when presenting progress, demos, or blockers to stakeholders.
- **Technical Direction & Standards:** Set and enforce coding standards, architecture alignment, and best practices across Frontend, Backend, and Database.
- **Code & PR Reviews:** Review pull requests for correctness, readability, and adherence to project conventions before merging to `main`.
- **Unblocking & Mentoring:** Help team members debug tough issues, resolve merge conflicts, and coordinate cross-module work.
- **Quality & Delivery Alignment:** Ensure features work end-to-end across Track A and Track B, and partner with the Scrum Master to flag risks early.
