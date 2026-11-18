# FindStay — Cloudflare Edge, CDN, WAF & Turnstile Configuration

- **Task:** [`S1-02-T3`](../scrum/sprint-01/stories/S1-02/tasks/S1-02-T3.md)
- **Story:** [`S1-02: Live Hosting & Daily Backups`](../scrum/sprint-01/stories/S1-02/README.md)
- **Date:** 2026-11-18 (Sprint 1, Day 4)
- **Conducted By:** Architecture, Cloud & Security (`@ObboyeBossman`)
- **Requirements Satisfied:**
  - `PD-06` — Deployment to cloud infrastructure (frontend via Cloudflare Workers Static Assets/CDN).
  - `TA-11` — Secure cloud environment configuration.
  - `NFR-27` — Edge security and confidential credential protection.

---

## 1. Cloudflare Workers Static Assets Setup

- **Staging URL:** [`https://findstay-web-staging.obboyebossman.workers.dev`](https://findstay-web-staging.obboyebossman.workers.dev)
- **Routing:** Single-page application (SPA) routing with HTML fallback for `/owner/*`, `/admin/*`, and `/guest/*`.
- **Protocol:** HTTP/2 & HTTP/3 enabled over TLS 1.3.

### Edge Verification Check:
```bash
curl -sI https://findstay-web-staging.obboyebossman.workers.dev
```
```http
HTTP/2 200 
server: cloudflare
content-type: text/html
cf-cache-status: HIT
cache-control: public, max-age=0, must-revalidate
```

---

## 2. CDN & Edge Caching Policies

- **Static Assets (`/assets/*`):** JavaScript bundles, CSS stylesheets, and WebP graphics are cached at Cloudflare edge POPs with immutable hash versioning (`Cache-Control: public, max-age=31536000, immutable`).
- **Dynamic HTML (`/index.html`):** Configured with `max-age=0, must-revalidate` to ensure immediate updates when new CI deployments publish.
- **R2 Storage CDN:** Cloudflare R2 bucket `findstay-property-images-staging` served via public CDN domain `https://pub-65b092013d304d62800aa0b7c65e2b52.r2.dev`.

---

## 3. Web Application Firewall (WAF) & Bot Protection

- **HTTPS Enforcement:** Automatic HTTPS redirect with HSTS (`Strict-Transport-Security: max-age=31536000; includeSubDomains`).
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - Strict Content-Security-Policy (CSP) headers applied at ingress.
- **DDoS Mitigation:** Cloudflare standard DDoS protection active across all entry points.

---

## 4. Cloudflare Turnstile Integration Contract

For bot protection on public forms (User Registration `S1-04`, Password Reset `S1-05`):
- **Widget Placement:** Embedded on client-side authentication screens (`/auth/login`, `/auth/register`).
- **Site Key:** Configured via `VITE_TURNSTILE_SITE_KEY` environment setting.
- **Verification Seam:** The Spring Boot backend validates client tokens with Cloudflare's validation endpoint:
  ```
  POST https://challenges.cloudflare.com/turnstile/v0/siteverify
  secret=<CLOUDFLARE_TURNSTILE_SECRET_KEY>&response=<TOKEN>&remoteip=<CLIENT_IP>
  ```
- **Turnstile Skill Reference:** Aligns with standard Cloudflare Turnstile bot verification patterns.
