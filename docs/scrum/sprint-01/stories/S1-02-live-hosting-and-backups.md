# S1-02: Cloud deployment, secrets, backups and monitoring

**Details:** Pri M, track A, D2 to D4
**Acceptance Criteria:** [See S1-02 in acceptance-criteria.md](../acceptance-criteria/acceptance-criteria.md)

## What Needs to Be Done
- *Done when:* The walking skeleton is live on cloud hosting; a backup is restored into a scratch database and timed.
- *Database:* Supabase Pro production project with daily automated backups; documented restore procedure; restore drill on D4.
- *API:* Spring Boot API on Render, Render PostgreSQL, frontend on Cloudflare Workers Static Assets; Cloudflare DNS, CDN, WAF and Turnstile protect public entry points; every secret in environment settings; `/health` endpoint; structured error logging.
- *Tests:* Uptime ping and alert on health failure; hosting tier confirmed not to sleep (P-10); no secret found by a repository scan.
