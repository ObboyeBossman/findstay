-- =====================================================================
-- FindStay V1_07 — verification module: owner verification & consents
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.3, §4.
-- Story owners of this module: S1-12 (owner ID & property
-- verification), S1-11 (privacy notice & user consent).
--
-- Key facts (ERD §3.3):
--   * consent_record lives HERE, not in identity (DEC-S1-01/F): the
--     consent endpoints and the Act 843 / P-12 handling live in
--     verification, and a table stays with the module that serves it.
--   * review_decision is shared by BOTH review queues — entity_kind
--     tells VERIFICATION from LISTING (S1-15's AC names it for listing
--     reviews too). entity_id is a polymorphic logical reference
--     (ERD §5 row 7); decided_by_user_id is logical to
--     identity.user_account (row 8). No FKs across the boundary.
--   * verification_case.organization_id is a logical reference to
--     organization.organization (ERD §5 row 5) — no FK.
--   * The Ghana Card number is encrypted with AES-256 before it
--     reaches this column (NFR-28, TA-09) — bytea ciphertext, and it
--     never appears in any API response.
--   * One case in review at a time per organisation (partial unique).
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS verification;

-- ---------------------------------------------------------------------
-- verification.verification_case — one owner-verification submission
-- per organisation review round. Status is set by the app on insert;
-- the decided event also updates organization.verification_status.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification.verification_case (
    id                            uuid        NOT NULL,
    organization_id               uuid        NOT NULL,
    status                        varchar(32) NOT NULL,
    ghana_card_number_encrypted   bytea       NOT NULL,
    submitted_at                  timestamptz NOT NULL,
    decided_at                    timestamptz,
    created_at                    timestamptz NOT NULL,
    updated_at                    timestamptz NOT NULL,
    CONSTRAINT verification_case_pkey PRIMARY KEY (id),
    CONSTRAINT verification_case_status_check
        CHECK (status IN ('PENDING', 'PARTIALLY_REJECTED', 'REJECTED', 'APPROVED'))
);
-- One case in review at a time per organisation (ERD §4)
CREATE UNIQUE INDEX IF NOT EXISTS verification_case_open_org_key
    ON verification.verification_case (organization_id)
    WHERE status = 'PENDING';
-- The admin review queue (S1-15) screens by org and status
CREATE INDEX IF NOT EXISTS verification_case_organization_id_idx
    ON verification.verification_case (organization_id);
CREATE INDEX IF NOT EXISTS verification_case_status_idx
    ON verification.verification_case (status);

-- ---------------------------------------------------------------------
-- verification.verification_document — one row per required document
-- type per case (Ghana Card, ownership proof, GTA licence), with its
-- own approval state and fix note. The FILE itself is found through
-- media.document (DEC-S1-01/I): this table holds workflow state only.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification.verification_document (
    id                   uuid        NOT NULL,
    verification_case_id uuid        NOT NULL,
    document_type        varchar(32) NOT NULL,
    status               varchar(32) NOT NULL DEFAULT 'PENDING',
    fix_note             varchar(1000),
    submitted_at         timestamptz NOT NULL,
    created_at           timestamptz NOT NULL,
    CONSTRAINT verification_document_pkey PRIMARY KEY (id),
    CONSTRAINT verification_document_case_id_fkey
        FOREIGN KEY (verification_case_id)
        REFERENCES verification.verification_case (id),
    CONSTRAINT verification_document_case_type_key
        UNIQUE (verification_case_id, document_type),
    CONSTRAINT verification_document_document_type_check
        CHECK (document_type IN ('GHANA_CARD', 'OWNERSHIP_PROOF', 'GTA_LICENCE')),
    CONSTRAINT verification_document_status_check
        CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

-- ---------------------------------------------------------------------
-- verification.review_decision — the admin's decision record for BOTH
-- review queues (entity_kind VERIFICATION | LISTING). reason is
-- required by the app when decision = REJECT; corrections carries the
-- fix list when REQUEST_CORRECTIONS; rejected_document_types holds the
-- per-document rejections for VERIFICATION cases (app-checked rules —
-- the ERD pins the shapes, not cross-column constraints).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification.review_decision (
    id                       uuid        NOT NULL,
    entity_kind              varchar(32) NOT NULL,
    entity_id                uuid        NOT NULL,
    decision                 varchar(32) NOT NULL,
    reason                   varchar(1000),
    corrections              jsonb,
    rejected_document_types  jsonb,
    decided_by_user_id       uuid        NOT NULL,
    decided_at               timestamptz NOT NULL,
    created_at               timestamptz NOT NULL,
    CONSTRAINT review_decision_pkey PRIMARY KEY (id),
    CONSTRAINT review_decision_entity_kind_check
        CHECK (entity_kind IN ('VERIFICATION', 'LISTING')),
    CONSTRAINT review_decision_decision_check
        CHECK (decision IN ('APPROVE', 'REQUEST_CORRECTIONS', 'REJECT'))
);
-- "Latest decision for X" — the admin review detail screen (SCR-18)
CREATE INDEX IF NOT EXISTS review_decision_entity_idx
    ON verification.review_decision (entity_kind, entity_id, decided_at DESC);

-- ---------------------------------------------------------------------
-- verification.consent_record — the Act 843 consent trail (S1-11).
-- Exactly S1-11's pinned shape (DEC-S1-01/F): user_id, policy_version,
-- consented_at, ip_address. user_id is a logical reference to
-- identity.user_account (ERD §5 row 6) — no FK. Append-only history:
-- every acceptance is a new row; /consents/latest reads the newest.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS verification.consent_record (
    id             uuid        NOT NULL,
    user_id        uuid        NOT NULL,
    policy_version varchar(32) NOT NULL,
    consented_at   timestamptz NOT NULL,
    ip_address     inet        NOT NULL,
    created_at     timestamptz NOT NULL,
    CONSTRAINT consent_record_pkey PRIMARY KEY (id)
);
-- GET /consents/latest — newest acceptance per user
CREATE INDEX IF NOT EXISTS consent_record_user_latest_idx
    ON verification.consent_record (user_id, consented_at DESC);
