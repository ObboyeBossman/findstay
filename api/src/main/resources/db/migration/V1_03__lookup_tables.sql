-- =====================================================================
-- FindStay V1_03 — shared lookup tables (structure only)
-- Task S1-01-T9 (issue #33), built from the approved ERD:
--   docs/design/erd.md §3.4 (accommodation_type, billing_period)
--   docs/design/erd.md §3.8 (platform_setting)
--   DEC-S1-01/H (lookup tables added to the canonical list)
--   DEC-S1-01/G (schemas named per module)
--
-- The seed VALUES are NOT inserted here: T15 (S1-01-T15, issue #24)
-- owns agreeing the exact starting values with the team and loads them
-- in its own additive migration (V1_13+). Keeping structure and values
-- apart respects "never edit an applied Flyway migration": once these
-- tables are applied everywhere, value changes are new migrations, not
-- edits. Tables live in their owning module's schema, so the `listing`
-- and `admin` schemas are created here, ahead of their module scripts.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS listing;
CREATE SCHEMA IF NOT EXISTS admin;

-- ---------------------------------------------------------------------
-- listing.accommodation_type — open, extensible accommodation categories
-- (NFR-46: owners/admins add new types without code changes, which a
-- CHECK constraint can never do). Seeded by T15.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.accommodation_type (
    id        uuid        NOT NULL,
    code      varchar     NOT NULL,
    name      varchar     NOT NULL,
    is_active boolean     NOT NULL DEFAULT true,
    CONSTRAINT accommodation_type_pkey PRIMARY KEY (id),
    CONSTRAINT accommodation_type_code_key UNIQUE (code)
);

-- ---------------------------------------------------------------------
-- listing.billing_period — the billing-period seam (module-boundaries
-- seam 3): NIGHTLY is the only active period in Sprint 1; MONTHLY,
-- PER_TERM and ACADEMIC_YEAR arrive seeded inactive for Sprints 4–5.
-- No WEEKLY, ever (T15 task doc). Seeded by T15.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.billing_period (
    id        uuid        NOT NULL,
    code      varchar     NOT NULL,
    name      varchar     NOT NULL,
    is_active boolean     NOT NULL DEFAULT false,
    CONSTRAINT billing_period_pkey PRIMARY KEY (id),
    CONSTRAINT billing_period_code_key UNIQUE (code)
);

-- ---------------------------------------------------------------------
-- admin.platform_setting — one home for key-value settings AND feature
-- flags (S1-16), including privacy.policy_version, which the consent
-- flow (S1-11) checks. Seeded by T15. Natural varchar key, not uuid:
-- the key IS the identity, referenced by name in code and seeds.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin.platform_setting (
    key                 varchar     NOT NULL,
    value               text        NOT NULL,
    description         varchar,
    is_feature_flag     boolean     NOT NULL DEFAULT false,
    updated_by_user_id  uuid,
    updated_at          timestamptz NOT NULL,
    CONSTRAINT platform_setting_pkey PRIMARY KEY (key)
);
