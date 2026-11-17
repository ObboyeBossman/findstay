-- =====================================================================
-- FindStay V1_10 — audit module: the immutable action trail
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.8, §4.
-- Story owner of this module: S1-08 (permanent activity log).
--
-- Key facts (ERD §3.8):
--   * Append-only is enforced by GRANTS, not constraints: the
--     application DB role (findstay_app, created in V1_12) holds
--     INSERT and SELECT on this table and nothing else — no UPDATE,
--     no DELETE grant exists to abuse (S1-08 AC 2: audit records
--     cannot be edited or deleted, even at the database role level).
--   * actor_id / org_id are logical references (identity.user_account,
--     organization.organization — ERD §5 row 15) — audit stays generic
--     by design: entity_type and entity_id are varchar strings, not
--     constrained to any table.
--   * org_id is NULL for pre-organisation events (sign-up, consent).
--   * action carries the 28-event taxonomy of the T6 map §4.5
--     (user.registered, listing.approved, availability.block_removed,
--     ...) with NO CHECK constraint: the taxonomy grows by addition in
--     later sprints, and the audit seam is reused by all modules
--     (module-boundaries seam 5) — a CHECK would force a migration per
--     new event.
--   * actor_name in API responses is joined at read time through
--     identity's public api — audit never denormalises names.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE IF NOT EXISTS audit.audit_log (
    id             uuid        NOT NULL,
    actor_id       uuid        NOT NULL,
    org_id         uuid,
    action         varchar(64) NOT NULL,
    entity_type    varchar(64) NOT NULL,
    entity_id      varchar(64) NOT NULL,
    metadata_json  jsonb       NOT NULL,
    created_at     timestamptz NOT NULL,
    CONSTRAINT audit_log_pkey PRIMARY KEY (id)
);

-- The admin trail screens (S1-08): browse newest first, by actor,
-- by organisation, by action — each with recency ordering.
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx
    ON audit.audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_actor_idx
    ON audit.audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_org_idx
    ON audit.audit_log (org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action_idx
    ON audit.audit_log (action, created_at DESC);
