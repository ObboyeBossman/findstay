-- =====================================================================
-- FindStay V1_14 — identity module: the auth-identity boundary
-- Recorded as DEC-S1-04/A (vendor boundaries), supersedes the id model
-- of DEC-S1-01/A. Landed ahead of S1-04 (issue #4), before any account
-- exists, so no data migration is needed — only this additive DDL.
--
-- Key facts:
--   * user_account.id is, from this decision on, an application-generated
--     UUIDv7 exactly like every other table id (it removes the one
--     exception the ERD used to carry). V1_04's column type is unchanged;
--     what changes is WHO generates the value: the provision flow, not
--     the auth vendor. V1_04's comments record the old rule and stay
--     untouched (applied migrations are never edited).
--   * identity.auth_identity is the only place a provider's own user id
--     is ever stored. One row per external credential:
--     (provider, provider_user_id) -> user_account_id.
--   * Every other module already stores user ids as plain logical uuid
--     references (the Modulith rule, ERD §1/§5) — those columns now carry
--     FindStay's permanent ids by definition, with no DDL change.
--   * Grants: V1_12's ALTER DEFAULT PRIVILEGES IN SCHEMA identity grants
--     later CRUD tables to findstay_app automatically — nothing to add
--     here (proven by the AuthIdentityBoundaryTest role probe).
-- =====================================================================

-- ---------------------------------------------------------------------
-- identity.auth_identity — one row per external sign-in credential.
-- provider is a closed set (house enum rule, ERD §1): adding a provider
-- is a deliberate migration, never silent drift. provider_user_id is
-- the vendor's own identifier (Supabase Auth uid today) — the ONLY
-- column in the database allowed to hold a vendor id.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS identity.auth_identity (
    id               uuid        NOT NULL,
    user_account_id  uuid        NOT NULL,
    provider         varchar(32) NOT NULL,
    provider_user_id varchar(255) NOT NULL,
    created_at       timestamptz NOT NULL,
    updated_at       timestamptz NOT NULL,
    CONSTRAINT auth_identity_pkey PRIMARY KEY (id),
    CONSTRAINT auth_identity_user_account_id_fkey
        FOREIGN KEY (user_account_id) REFERENCES identity.user_account (id),
    CONSTRAINT auth_identity_provider_check
        CHECK (provider IN ('SUPABASE')),
    CONSTRAINT auth_identity_provider_key
        UNIQUE (provider, provider_user_id)
);

-- Resolve credentials per request: the JWT filter looks a provider uid
-- up to find the FindStay user id (the /me and provision hot path).
CREATE INDEX IF NOT EXISTS auth_identity_user_account_idx
    ON identity.auth_identity (user_account_id);
