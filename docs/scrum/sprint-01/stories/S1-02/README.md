# S1-02: Live Hosting & Daily Backups

**Details:** Priority: Must | Track A | Days 2–4  
**Acceptance Criteria:** See [acceptance-criteria.md](./acceptance-criteria.md)

## Done When
- The starter website, backend server, and database are live in their cloud homes.
- Daily automatic database backups are turned on and a test restore into a scratch database is timed.
- All passwords and secret keys are stored in environment settings (never in code), and health alerts are active.

## Tasks

| Task ID | Task | Tag | Depends On | Role | Assignee | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: |
| [`S1-02-T1`](./tasks/S1-02-T1.md) | Deploy starter frontend to Cloudflare Workers Static Assets | `devops` | [`S1-01-T5`](../S1-01/tasks/S1-01-T5.md), [`S1-01-T10`](../S1-01/tasks/S1-01-T10.md) | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-02-T2`](./tasks/S1-02-T2.md) | Deploy Spring Boot API & PostgreSQL to Render | `devops` | [`S1-01-T7`](../S1-01/tasks/S1-01-T7.md), [`S1-01-T9`](../S1-01/tasks/S1-01-T9.md), [`S1-01-T10`](../S1-01/tasks/S1-01-T10.md) | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-02-T3`](./tasks/S1-02-T3.md) | Configure Cloudflare DNS, CDN, WAF & Turnstile | `devops` | [`S1-02-T1`](./tasks/S1-02-T1.md), [`S1-02-T2`](./tasks/S1-02-T2.md) | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-02-T4`](./tasks/S1-02-T4.md) | Store live secrets in environment settings & create .env.example | `devops` | [`S1-01-T10`](../S1-01/tasks/S1-01-T10.md) | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-02-T5`](./tasks/S1-02-T5.md) | Confirm non-sleeping hosting (P-10) & set up /actuator/health uptime alerts | `devops` | [`S1-02-T2`](./tasks/S1-02-T2.md), [`S1-02-T4`](./tasks/S1-02-T4.md) | Architecture, Cloud & Security | @ObboyeBossman | Done |
| [`S1-02-T6`](./tasks/S1-02-T6.md) | Enable daily automated backups & document restore guide | `database` | [`S1-02-T2`](./tasks/S1-02-T2.md) | Database & Data | @fummey | Done |
| [`S1-02-T7`](./tasks/S1-02-T7.md) | Run Day 4 backup restore drill into scratch database | `database` | [`S1-02-T6`](./tasks/S1-02-T6.md) | Database & Data | @fummey | Done |
| [`S1-02-T8`](./tasks/S1-02-T8.md) | Scan repo for leaked secrets & verify live health monitor | `testing` | [`S1-02-T3`](./tasks/S1-02-T3.md), [`S1-02-T4`](./tasks/S1-02-T4.md), [`S1-02-T5`](./tasks/S1-02-T5.md) | QA & Testing | @badu12-png | Done |
