# S1-04-T7 Verification Evidence — Auth Flows, JWT Rejection & Browser Key Safety

- **Story:** [`S1-04`](../scrum/sprint-01/stories/S1-04/README.md) — Sign-Up, Confirmation & Sign-In
- **Task:** [`S1-04-T7`](../scrum/sprint-01/stories/S1-04/tasks/S1-04-T7.md)
- **Verified on:** 2026-11-20T16:08Z
- **Verified by:** `@ObboyeBossman`
- **Linked requirements:** `BRL-01`, `UR-G01`, `FR-01`, `FR-02`, `FR-03`, `FR-05`, `NFR-19`, `NFR-22`, `TA-07`, `TA-08`
- **CI reference:** PR #59 (`fb1bfd0`) & PR #60 (`05fb233`) — both `CI/api` (JDK 21, 80/80 tests + `@Req` + Modulith) and `CI/web` (`lint:theme` + `typecheck` + `build`) passed.

---

## 1. Automated Backend Auth, Provisioning & Modulith Suite (`S1-04-AC1`, `S1-04-AC2`)

Command executed against throwaway Testcontainers PostgreSQL (`postgres:16.4-alpine`):

```bash
cd api && mvn test -Dtest=SecurityJwtValidationTest,IdentityProvisioningIntegrationTest,ModulithStructureTest
```

**Result:** `Tests run: 12, Failures: 0, Errors: 0, Skipped: 0` (`BUILD SUCCESS`)

| Test Class | `@Req` Tag | Verified Cases | Result |
| :--- | :--- | :--- | :---: |
| [`SecurityJwtValidationTest`](../../api/src/test/java/com/findstay/shared/security/SecurityJwtValidationTest.java) | `S1-04-AC2` | `rejectsAnonymousRequest`, `rejectsMalformedToken`, `rejectsExpiredToken`, `rejectsWrongIssuerToken`, `acceptsValidSignedToken` (JWKS RSA signature + issuer validation) | PASS (5/5) |
| [`IdentityProvisioningIntegrationTest`](../../api/src/test/java/com/findstay/identity/IdentityProvisioningIntegrationTest.java) | `S1-04-AC1` | `provisionCreatesAccountAndProfileIdempotently`, `getMeLazyProvisionsMissingAccount`, `patchMeUpdatesProfileAndValidatesPhone`, `suspendedAccountIsRejectedWithForbidden`, `anonymousMeRequestIsRejected`, `lookupReturnsExistenceAndDisplayNameWithoutAuth` | PASS (6/6) |
| [`ModulithStructureTest`](../../api/src/test/java/com/findstay/ModulithStructureTest.java) | Architecture | `ApplicationModules.verify()` across all 8 module seams | PASS (1/1) |

---

## 2. Live API Protected-Route JWT Rejection Probes

Probed live local backend (`http://localhost:8080`, PostgreSQL 16 via `findstay-db`, all 15 Flyway migrations applied):

| Probe | Request | Expected | Actual |
| :--- | :--- | :---: | :---: |
| Missing `Authorization` header | `GET /api/v1/me` | `401` | `HTTP 401` |
| Malformed bearer token | `GET /api/v1/me` (`Authorization: Bearer not-a-jwt`) | `401` | `HTTP 401` |
| Expired / wrong-issuer / invalid signature JWT | `GET /api/v1/me` (`iss=https://evil.example.com`, `exp=1`) | `401` | `HTTP 401` |
| Public health surface | `GET /api/v1/health` | `200` | `HTTP 200` (`status: UP`, `db: UP`) |
| Public email lookup | `POST /api/v1/auth/lookup` (`{"email":"nonexistent@example.com"}`) | `200` | `HTTP 200` (`{"exists":false,"displayName":null}`) |

---

## 3. Registration, OTP Verification, Sign-In & Sign-Out Flows (`S1-04-AC1`)

- **Supabase Auth (`findstay-staging`, `xavnlsinbzfcaacfzqac`):**
  - Custom SMTP configured via Resend (`smtp.resend.com`, sender `FindStay <no-reply@send.attendsys.app>`).
  - Email OTP length set to **6 digits**; branded **Confirm sign up** and **Reset password** templates configured with `{{ .Token }}`.
  - End-to-end registration tested live: email entry → 5-stage sign-up (email, full name, Ghana phone `024 000 0000`, password + confirm, Ghana Act 843 terms + Turnstile) → email OTP delivery & verification on `/auth/verify` → verified success screen & pulsing FindStay loader → authenticated session & sign-out.
- **Phone toggle (`#58`):** Verified **Continue with Phone** toggles label/icon to **Continue with Email**, switches input to Ghana phone format, and clears input/errors on toggle (merged to `staging` in PR #60).

---

## 4. Browser Key Safety & Zero Local Password/OTP Storage (`S1-04-AC3`)

Command executed after fresh production build (`npm run build` — `lint:theme` OK, `tsc --noEmit` OK, `vite build` 7.27s):

```bash
grep -rnEi "service_role|SUPABASE_SERVICE_ROLE|R2_SECRET_ACCESS_KEY|SPRING_DATASOURCE_PASSWORD|password_hash|otp_table" web/dist/
grep -rnEi "service_role|SUPABASE_SERVICE_ROLE|R2_SECRET_ACCESS_KEY|SPRING_DATASOURCE_PASSWORD" web/src/
grep -rnEi "password_hash|otp_code|otp_token" api/src/main/resources/db/migration/
```

| Check | Scope | Result |
| :--- | :--- | :---: |
| No service-role or server secrets in built browser bundle | `web/dist/` | **CLEAN (0 matches)** |
| No service-role or server secrets in browser source | `web/src/` | **CLEAN (0 matches)** |
| No password-hash or OTP tables/columns in FindStay database | `api/src/main/resources/db/migration/V1_01..V1_15` | **CLEAN (0 matches)** |
