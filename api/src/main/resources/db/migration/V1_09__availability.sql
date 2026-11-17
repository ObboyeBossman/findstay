-- =====================================================================
-- FindStay V1_09 — availability module: the calendar blocks
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.5, §4.
-- Story owner of this module: S1-14 (room availability calendar).
--
-- Key facts (ERD §3.5):
--   * unit_id is a LOGICAL reference to listing.unit (ERD §5 row 11)
--     — plain uuid, no FK across the module boundary.
--   * The one database-level business rule in Sprint 1 lives here:
--     a GiST exclusion constraint (unit_id =, tstzrange &&) makes
--     overlapping blocks for the same unit impossible to INSERT,
--     whatever the application does (S1-14's acceptance criterion).
--     It needs the btree_gist extension — already enabled by V1_01.
--   * reason is a CHECK, not a lookup table: the three values are
--     fixed by design (OWNER_BLOCK now; HOLD and BOOKING arrive as
--     additive CHECK-widening migrations in Sprint 2 — module-
--     boundaries seam 1).
--   * The exclusion index doubles as the unit_id lookup index (ERD §4)
--     — no separate plain index is needed.
--   * created_by_user_id is a logical reference to
--     identity.user_account (ERD §5 row 12) — no FK.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS availability;

CREATE TABLE IF NOT EXISTS availability.availability_block (
    id                  uuid        NOT NULL,
    unit_id             uuid        NOT NULL,
    start_at            timestamptz NOT NULL,
    end_at              timestamptz NOT NULL,
    reason              varchar(32) NOT NULL DEFAULT 'OWNER_BLOCK',
    created_by_user_id  uuid        NOT NULL,
    created_at          timestamptz NOT NULL,
    CONSTRAINT availability_block_pkey PRIMARY KEY (id),
    CONSTRAINT availability_block_reason_check CHECK (reason = 'OWNER_BLOCK'),
    CONSTRAINT availability_block_range_check CHECK (end_at > start_at),
    CONSTRAINT availability_block_no_overlap
        EXCLUDE USING gist
            (unit_id WITH =, tstzrange(start_at, end_at) WITH &&)
);
