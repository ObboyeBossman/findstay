# S1-11-T5 — Data-Minimisation Review & Authorised-Only Access Evidence

- **Story:** `S1-11` (Privacy Notice & User Consent — Ghana Data Protection Act, 2012, Act 843)
- **Requirements:** `NFR-31`, `NFR-32`, `NFR-35`, `NFR-36`

---

## 1. Field-by-Field Data-Minimisation Review (`NFR-32`)

| Flow | Fields Collected | Justification | Excluded Excess Data |
| :--- | :--- | :--- | :--- |
| **Registration (`/auth/sign-up`)** | Email, full name, password (Supabase Auth only), mandatory Act 843 consent checkbox | Account creation, OTP verification, and statutory consent (`NFR-31`) | No date of birth, gender, national ID, or payment credentials collected at registration |
| **Profile (`/profile`)** | Full name, optional Ghana phone (`+233...`), preferred language | Booking/owner communication and localisation | No secondary address or sensitive government IDs on profile |
| **Owner Verification (`/owner/verification`)** | Ghana Card PIN (AES-256-GCM encrypted), Ghana Card scan, ownership proof, GTA licence | Required under Ghana Tourism Authority (GTA) host compliance | Raw Ghana Card PIN never returned in any API response (masked `GHA-******789-5`); documents restricted to private R2 bucket |
| **Consent Record (`verification.consent_record`)** | `user_id`, `policy_version`, `consented_at`, `ip_address` (`inet`) | Act 843 proof of informed consent & version re-consent (`NFR-36`) | No tracking cookies or third-party marketing flags |

---

## 2. Authorised-Only Access Verification (`NFR-35`)

- **Public Listing DTOs (`GET /api/v1/properties/*`):** Automated test `ConsentAndPrivacyIntegrationTest.publicListingDtoNeverExposesPrivateOwnerContactOrGovernmentIdData` verifies anonymous public responses contain zero owner email, zero phone numbers, zero Ghana Card strings, and zero private document URLs.
- **Consent Endpoints (`GET /api/v1/consents/latest`, `POST /api/v1/me/consents`):** Strictly scoped to `OrgScope.requireUserId(jwt)` behind `consent.read` / `consent.write`; unauthenticated requests return `401`.
- **Private Verification Documents (`GET /api/v1/media/{assetId}/signed-url`):** Restricted to owning `OWNER` or `ADMIN` with `media.private.read` (`VerificationModuleIntegrationTest` proves `STAFF`, `GUEST`, and cross-org owners receive `403`/`404`).
