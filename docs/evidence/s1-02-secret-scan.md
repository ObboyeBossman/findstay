# FindStay — Security Hygiene & Live Health Verification Report

- **Task:** [`S1-02-T8`](../scrum/sprint-01/stories/S1-02/tasks/S1-02-T8.md)
- **Story:** [`S1-02: Live Hosting & Daily Backups`](../scrum/sprint-01/stories/S1-02/README.md)
- **Date Conducted:** 2026-11-18 (Sprint 1, Day 4)
- **Conducted By:** QA & Testing (`@badu12-png`) & Tech Lead (`@ObboyeBossman`)
- **Requirements Verified:**
  - `PD-12` — Confidential credentials stored in secure environment settings, not source code.
  - `TA-11` — Secure storage of database passwords and secret keys (environment variables).
  - `NFR-27` — Protect confidential application credentials and secret keys.
  - `PD-10` — Backend application-health monitoring.
  - `NFR-43` — Provide error logging and monitoring.

---

## 1. Secret Leakage Audit (`scripts/scan-secrets.mjs`)

An automated security audit was run across the entire codebase and git commit history to detect any exposed credentials, database passwords, private keys, or API tokens.

### Audit Command & Output
```bash
node scripts/scan-secrets.mjs
```
```
====================================================
FindStay Security & Credential Hygiene Scanner
Requirement: PD-12, TA-11, NFR-27
====================================================
🔍 Scanning tracked repository files...
🔍 Scanning git commit history for leaked private keys or credentials...
✅ PASS: No leaked secrets, private keys, or passwords detected.
All tracked files and commit history meet FindStay credential hygiene standards.
```

### Checks Performed:
- **Private Keys:** 0 RSA/EC/OpenSSH private keys found in files or commit history.
- **Database Credentials:** All connection strings use environment variables (`${SPRING_DATASOURCE_URL}`).
- **Storage Keys:** Cloudflare R2 tokens managed via Render/Cloudflare environment secrets.
- **Auth Secrets:** Supabase service keys and JWKS URLs kept out of git.
- **Gitignore Compliance:** `.env`, `.env.staging`, and local credentials confirmed ignored.
- **Example Files:** `api/.env.example` and `web/.env.example` verified free of sensitive default values.

---

## 2. Live Health & Uptime Monitor Verification

The staging backend application health was checked directly via Spring Boot Actuator:

### Health Endpoint Check:
```bash
curl -i https://findstay-api-staging.onrender.com/actuator/health
```
```http
HTTP/2 200 
content-type: application/vnd.spring-boot.actuator.v3+json

{"status":"UP","components":{"db":{"status":"UP"},"diskSpace":{"status":"UP"},"livenessState":{"status":"UP"},"ping":{"status":"UP"},"readinessState":{"status":"UP"}},"groups":["liveness","readiness"]}
```

### Health Check Results:
- **Application Status:** `UP`
- **Database Connection (`db`):** `UP` (Supabase Session Pooler active and responsive)
- **Disk Space:** `UP`
- **Liveness & Readiness Probes:** `UP`
- **Automated Uptime Monitor:** Configured in [`.github/workflows/uptime-monitor.yml`](../../.github/workflows/uptime-monitor.yml) to ping health every 10 minutes and prevent Render instance sleeping (`P-10`).

---

## 3. Sign-Off
Both the credential hygiene scan and the live health check passed without findings. Story `S1-02` security and monitoring requirements are satisfied.
