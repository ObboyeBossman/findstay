# FindStay — Feasibility Study

## 1. Technical Feasibility
FindStay is technically feasible because its core functions — authentication, listings, search, calendars, booking workflows, online payments, notifications, dashboards, and reporting — are established web-application capabilities. The main technical challenge is ensuring that availability, payment events, booking status, and financial records remain consistent. A modular design (`Spring Modulith`), role-based authorisation, transaction-safe booking workflow (`btree_gist` overlap exclusion), payment-provider callbacks, automated testing, monitoring, and backup procedures address these risks directly.

## 2. Operational Feasibility
The system is operationally feasible because it serves clearly defined users with identifiable workflows: guests find and book stays; owners manage properties and operations; and administrators verify and govern platform activity. Success requires owner onboarding, verification procedures, usable dashboards, support processes, and clear cancellation, refund, review, and dispute policies. User-acceptance testing with intended guests and accommodation providers validates whether the workflows are understandable in practice.

## 3. Economic Feasibility
The project requires planned spending on a domain, production hosting, database and media storage, email or SMS notifications, payment-gateway charges, security controls, and maintenance. A group approach makes the workload and costs shareable across the 11 team members, while using free/low-cost cloud tiers (Cloudflare Workers + R2, Render PostgreSQL, Supabase Auth) keeps recurring costs manageable.

## 4. Schedule Feasibility
Schedule feasibility depends on managing the work as phased two-week sprints: foundation and owner listings (Sprint 1); search, booking, and payments (Sprint 2); operations, trust, and Phase 1 launch (Sprint 3); long-term rentals and maintenance (Sprint 4); and accounting, student hostels, and final release (Sprint 5). Each sprint has named owners, measurable deliverables, and integration checkpoints.

## 5. Legal, Security, and Organisational Feasibility
The project is feasible because it incorporates Ghana Data Protection Act, 2012 (Act 843) responsibilities, payment-provider requirements (Paystack hosted checkout), and Ghana Tourism Authority (GTA) / Ghana Card verification practices into its implementation and operating procedures.
