-- =====================================================================
-- FindStay V1_04 — identity module: accounts, profiles, RBAC catalogue
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.1, §4.
-- Story owners of this module: S1-04 (sign-up/sign-in), S1-05 (profile),
-- S1-06 (roles & permissions).
--
-- Key facts (ERD §1/§3.1):
--   * user_account.id IS the Supabase Auth user id (DEC-S1-01/A) — no
--     database default; the provision flow copies it in.
--   * All other ids are application-generated UUIDv7 (RFC 9562) — never
--     a database default, never serial.
--   * Timestamps are application-provided TIMESTAMPTZ UTC; the T9
--     scripts create no triggers (ERD §1).
--   * Org-level roles live on organization.membership.role, NOT here.
--     identity.role is the platform RBAC catalogue.
--   * The four platform roles are the one seed T9 inserts: they are
--     pinned verbatim in the ERD (§3.1: GUEST | OWNER | STAFF | ADMIN)
--     and user_account.role_id needs the seeded GUEST row's fixed id
--     as its DEFAULT (ERD §4). Fixed UUIDv7 constants keep the DDL and
--     the seed in one file, applied atomically.
--   * permission / role_permission are structure only: the permission
--     catalogue is S1-06's deliverable and lands as its own additive
--     migration once the codes are agreed.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS identity;

-- ---------------------------------------------------------------------
-- identity.role — the four platform roles. user_account.role_id
-- defaults to the seeded GUEST row; ADMIN marks administrators.
-- Created before its dependants: user_account and role_permission
-- both reference it.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.role (
    id          uuid    NOT NULL,
    code        varchar NOT NULL,
    name        varchar NOT NULL,
    description varchar NOT NULL,
    CONSTRAINT role_pkey PRIMARY KEY (id),
    CONSTRAINT role_code_key UNIQUE (code)
);

-- ---------------------------------------------------------------------
-- identity.permission — one row per permission code (module-prefixed,
-- e.g. listing.write, admin.review.decide). Seeded by S1-06.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.permission (
    id          uuid    NOT NULL,
    code        varchar NOT NULL,
    description varchar NOT NULL,
    CONSTRAINT permission_pkey PRIMARY KEY (id),
    CONSTRAINT permission_code_key UNIQUE (code)
);

-- ---------------------------------------------------------------------
-- identity.role_permission — the table-driven RBAC seam (module-
-- boundaries seam 6). Composite PK; no surrogate id.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.role_permission (
    role_id       uuid NOT NULL,
    permission_id uuid NOT NULL,
    CONSTRAINT role_permission_pkey PRIMARY KEY (role_id, permission_id),
    CONSTRAINT role_permission_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES identity.role (id),
    CONSTRAINT role_permission_permission_id_fkey
        FOREIGN KEY (permission_id) REFERENCES identity.permission (id)
);

-- ---------------------------------------------------------------------
-- identity.user_account — one row per person, provisioned on first
-- sign-in (DEC-S1-01/A). Email is unique case-insensitively; it is
-- copied from Supabase at provision and never used for login by us.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.user_account (
    id                 uuid        NOT NULL,
    email              varchar     NOT NULL,
    role_id            uuid        NOT NULL DEFAULT '01a15451-a800-7001-bf00-000000000001'::uuid,
    status             varchar     NOT NULL DEFAULT 'ACTIVE',
    suspended_at       timestamptz,
    suspension_reason  varchar,
    created_at         timestamptz NOT NULL,
    updated_at         timestamptz NOT NULL,
    CONSTRAINT user_account_pkey PRIMARY KEY (id),
    CONSTRAINT user_account_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES identity.role (id),
    CONSTRAINT user_account_status_check
        CHECK (status IN ('ACTIVE', 'SUSPENDED'))
);

-- Case-insensitive email uniqueness (ERD §4: unique index on lower(email))
CREATE UNIQUE INDEX IF NOT EXISTS user_account_email_key
    ON identity.user_account (lower(email));
-- Admin user list filters by status (S1-16)
CREATE INDEX IF NOT EXISTS user_account_status_idx
    ON identity.user_account (status);

-- ---------------------------------------------------------------------
-- identity.user_profile — 1:1 with user_account (S1-05). user_id is
-- both PK and FK: one profile per person, no orphans.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.user_profile (
    user_id             uuid        NOT NULL,
    full_name           varchar     NOT NULL,
    phone               varchar(20),
    avatar_url          text,
    preferred_language  varchar(16) NOT NULL DEFAULT 'en',
    updated_at          timestamptz NOT NULL,
    CONSTRAINT user_profile_pkey PRIMARY KEY (user_id),
    CONSTRAINT user_profile_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES identity.user_account (id)
);

-- ---------------------------------------------------------------------
-- Seed: the four platform roles (ERD §3.1, pinned).
-- Fixed UUIDv7 ids (RFC 9562) generated from the 2026-11-17 merge date
-- of the ERD; the GUEST id is referenced by user_account.role_id's
-- DEFAULT above. Idempotent: ON CONFLICT DO NOTHING (ERD §6).
-- ---------------------------------------------------------------------
INSERT INTO identity.role (id, code, name, description) VALUES
    ('01a15451-a800-7001-bf00-000000000001', 'GUEST', 'Guest',
     'Default platform role for every newly provisioned account.'),
    ('01a15451-a800-7002-bf00-000000000002', 'OWNER', 'Owner/Manager',
     'Property owner or manager; may hold OWNER memberships in organisations.'),
    ('01a15451-a800-7003-bf00-000000000003', 'STAFF', 'Property Staff',
     'Property staff; may hold STAFF memberships in organisations.'),
    ('01a15451-a800-7004-bf00-000000000004', 'ADMIN', 'Administrator',
     'Platform administrator with admin-area access.')
ON CONFLICT (code) DO NOTHING;
