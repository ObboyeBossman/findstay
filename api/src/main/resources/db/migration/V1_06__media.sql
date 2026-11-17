-- =====================================================================
-- FindStay V1_06 — media module: every uploaded object, and who owns it
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.6, §4.
-- Story owner of this module: S1-09 (photo & document uploads).
--
-- Key facts (ERD §3.6, DEC-S1-01/I):
--   * Two-table split: media_asset is the Cloudflare R2 object registry
--     (bucket, key, size, upload state — created at presign time, which
--     is why the photo presign can return a photoId); document is the
--     SINGLE ownership link (owner_type, owner_id, media_asset_id,
--     storage_key). Business tables store no asset ids.
--   * document.owner_id is a polymorphic LOGICAL reference — by
--     owner_type it points at listing.property.id,
--     verification.verification_document.id, or
--     identity.user_account.id (ERD §5 row 14) — plain uuid, no FK.
--   * media_asset.organization_id is a logical reference to
--     organization.organization (ERD §5 row 13) — no FK.
--   * storage_key is denormalised onto document for direct pre-signed
--     GETs (S1-09 AC), so the hot read needs no join.
--   * Size cap 5 MB enforced at the database level too (NFR-17), not
--     only at presign.
--   * media_asset.status can mark DELETED so the audit trail keeps
--     pointing at something (ERD §1) — rows are never hard-deleted.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS media;

-- ---------------------------------------------------------------------
-- media.media_asset — the R2 object registry. One row per authorised
-- upload, created at presign (PENDING_UPLOAD) and flipped to READY
-- when the browser's PUT succeeds.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media.media_asset (
    id              uuid        NOT NULL,
    organization_id uuid        NOT NULL,
    bucket          varchar(32) NOT NULL,
    storage_key     varchar(512) NOT NULL,
    content_type    varchar(100) NOT NULL,
    size_bytes      bigint      NOT NULL,
    status          varchar(32) NOT NULL DEFAULT 'PENDING_UPLOAD',
    created_at      timestamptz NOT NULL,
    uploaded_at     timestamptz,
    CONSTRAINT media_asset_pkey PRIMARY KEY (id),
    CONSTRAINT media_asset_storage_key_key UNIQUE (storage_key),
    CONSTRAINT media_asset_bucket_check
        CHECK (bucket IN ('PUBLIC_IMAGES', 'PRIVATE_DOCS')),
    CONSTRAINT media_asset_size_bytes_check
        CHECK (size_bytes BETWEEN 1 AND 5242880),
    CONSTRAINT media_asset_status_check
        CHECK (status IN ('PENDING_UPLOAD', 'READY', 'DELETED'))
);
CREATE INDEX IF NOT EXISTS media_asset_organization_id_idx
    ON media.media_asset (organization_id);

-- ---------------------------------------------------------------------
-- media.document — the single ownership link (DEC-S1-01/I).
-- owner_type decides what owner_id points at; the writing module
-- validates owner_id through the owning module's public api BEFORE
-- storing it (ERD §5 discipline) — the database does not.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media.document (
    id             uuid        NOT NULL,
    owner_type     varchar(32) NOT NULL,
    owner_id       uuid        NOT NULL,
    media_asset_id uuid        NOT NULL,
    storage_key    varchar(512) NOT NULL,
    created_at     timestamptz NOT NULL,
    CONSTRAINT document_pkey PRIMARY KEY (id),
    CONSTRAINT document_media_asset_id_fkey
        FOREIGN KEY (media_asset_id) REFERENCES media.media_asset (id),
    CONSTRAINT document_owner_type_check
        CHECK (owner_type IN ('PROPERTY_PHOTO', 'VERIFICATION_DOCUMENT', 'AVATAR')),
    CONSTRAINT document_owner_key
        UNIQUE (owner_type, owner_id, media_asset_id)
);
-- The hot lookup: "which files belong to X" (pre-signed GETs, admin review)
CREATE INDEX IF NOT EXISTS document_owner_idx
    ON media.document (owner_type, owner_id);
