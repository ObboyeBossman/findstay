# S1-02: Acceptance Criteria

- **Story:** [S1-02: Live Hosting & Daily Backups](./README.md)
- **Who this helps:** Property owners & administrators (relying on a dependable, backed-up live system)
- **Priority:** Must have | **Track:** Track A | **Days:** D2–D4
- **Summary:** Put the starter website, backend server, and database online, turn on daily database backups, and practise restoring a backup.
- **Screens involved:** Live cloud URLs for Owner and Admin portals behind Cloudflare security
- **Database tables:** Daily automated Render PostgreSQL backups + Day 4 scratch restore verification
- **System actions:** Cloudflare Workers Static Assets + Render Spring Boot API + error alerts + uptime monitor

## What Proves This Story Is Finished

1. The starter website, backend server, and database are live in their cloud homes.
2. Daily automatic database backups are turned on and a test restore into a scratch database is timed.
3. All passwords and secret keys are stored in environment settings (never in code), and health alerts are active.

## Linked Requirements

- **Technical:** [`PD-06`](../../../../requirements/technical/technical-requirements.md), [`PD-10`](../../../../requirements/technical/technical-requirements.md), [`PD-11`](../../../../requirements/technical/technical-requirements.md), [`PD-12`](../../../../requirements/technical/technical-requirements.md), [`TA-11`](../../../../requirements/technical/technical-requirements.md)
- **Functional:** [`UR-ON05`](../../../../requirements/functional/functional-requirements.md)
- **Non-Functional:** [`NFR-27`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-42`](../../../../requirements/non-functional/non-functional-requirements.md), [`NFR-43`](../../../../requirements/non-functional/non-functional-requirements.md)
