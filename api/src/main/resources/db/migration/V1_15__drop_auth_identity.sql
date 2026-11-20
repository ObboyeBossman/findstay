-- =====================================================================
-- FindStay V1_15 — identity module: the DEC-S1-04/B revert
-- Supersedes DEC-S1-04/A (vendor boundaries) with DEC-S1-04/B (direct
-- integration): no preemptive boundary abstraction. V1_14's
-- identity.auth_identity is dropped; user_account.id is the Supabase
-- Auth uid again (the DEC-S1-01/A id model, restored).
--
-- Key facts:
--   * Landed the day after V1_14 (PR #55), while the database still
--     holds zero accounts and no story code touches the boundary —
--     nothing to migrate, only this drop.
--   * user_account.id needs no DDL change: V1_14 never altered the
--     column, only the rule of who generates the value. The provision
--     flow (DEC-S1-01/A, S1-04) copies the Supabase uid in, as before.
--   * V1_14 stays in flyway_schema_history untouched — applied
--     migrations are never edited; this script is the revert record.
--   * Idempotent (IF EXISTS), like every FindStay script.
-- =====================================================================

DROP TABLE IF EXISTS identity.auth_identity;
