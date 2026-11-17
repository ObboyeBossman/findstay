-- =====================================================================
-- FindStay V1_08 — listing module: properties, rooms, prices, the
-- public search projection
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.4, §4.
-- Story owners of this module: S1-13 (create properties, rooms &
-- prices), S1-15 (admin review & listing approval).
--
-- Key facts (ERD §3.4):
--   * property is the owner's working copy (drafts are genuinely
--     partial — the contract only requires name, accommodation type
--     and town at create); listing is the published public projection,
--     denormalised and search-indexed so anonymous reads never join
--     across modules (CatalogQuery seam).
--   * property.organization_id is a logical reference to
--     organization.organization (ERD §5 row 9) — no FK.
--   * property_photo.document_id is a logical reference to
--     media.document with owner_type = PROPERTY_PHOTO (row 10) — no
--     FK; the bytes belong to media, the ordering to listing.
--   * rate_plan, not unit, holds the price: one row per unit per
--     billing period, so dormant periods can be switched on later
--     without touching unit (billing-period seam).
--   * Money is BIGINT integer pesewas with currency = 'GHS' (NFR-08).
--   * The 10-photo cap is enforced by the application at presign
--     (review checklist item 4) — not by a trigger or constraint.
--   * accommodation_type / billing_period / area / amenity carry no
--     timestamp columns (ERD §3.4); their seed values belong to T15
--     (types, periods, settings) and S1-13 (amenities, areas).
-- =====================================================================

-- (the listing schema itself is created by V1_03, which owns the
--  lookup tables living in it — see that file for the reasoning)

-- ---------------------------------------------------------------------
-- listing.area — Takoradi areas (seeded by S1-13-T3 from the agreed
-- list). Reference table, not a CHECK: areas are managed data.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.area (
    id        uuid     NOT NULL,
    name      varchar  NOT NULL,
    is_active boolean  NOT NULL DEFAULT true,
    CONSTRAINT area_pkey PRIMARY KEY (id),
    CONSTRAINT area_name_key UNIQUE (name)
);

-- ---------------------------------------------------------------------
-- listing.amenity — the amenity catalogue (seeded by S1-13 from the
-- agreed list). display_order drives the picker's grouping.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.amenity (
    id            uuid     NOT NULL,
    code          varchar  NOT NULL,
    name          varchar  NOT NULL,
    is_active     boolean  NOT NULL DEFAULT true,
    display_order integer  NOT NULL,
    CONSTRAINT amenity_pkey PRIMARY KEY (id),
    CONSTRAINT amenity_code_key UNIQUE (code)
);
CREATE INDEX IF NOT EXISTS amenity_display_order_idx
    ON listing.amenity (display_order);

-- ---------------------------------------------------------------------
-- listing.property — the owner's working copy. Incomplete drafts are
-- allowed here (the app blocks incomplete ones from submission,
-- S1-13 AC 2); the required-at-create columns are NOT NULL, the rest
-- arrive before submit.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.property (
    id                     uuid         NOT NULL,
    organization_id        uuid         NOT NULL,
    name                   varchar      NOT NULL,
    description            text,
    accommodation_type_id  uuid         NOT NULL,
    town                   varchar      NOT NULL,
    area_id                uuid,
    address                varchar,
    latitude               numeric(9,6),
    longitude              numeric(9,6),
    house_rules            text,
    status                 varchar(32)  NOT NULL DEFAULT 'DRAFT',
    created_at             timestamptz  NOT NULL,
    updated_at             timestamptz  NOT NULL,
    CONSTRAINT property_pkey PRIMARY KEY (id),
    CONSTRAINT property_accommodation_type_id_fkey
        FOREIGN KEY (accommodation_type_id)
        REFERENCES listing.accommodation_type (id),
    CONSTRAINT property_area_id_fkey
        FOREIGN KEY (area_id) REFERENCES listing.area (id),
    CONSTRAINT property_status_check
        CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'CORRECTIONS_REQUESTED',
                          'ACTIVE', 'PAUSED', 'SUSPENDED', 'REJECTED'))
);
-- OrgScope filter (every owner-scoped query starts here)
CREATE INDEX IF NOT EXISTS property_organization_id_idx
    ON listing.property (organization_id);
-- Owner property lists filter by status; the guest town browse
CREATE INDEX IF NOT EXISTS property_status_idx ON listing.property (status);
CREATE INDEX IF NOT EXISTS property_town_idx ON listing.property (town);

-- ---------------------------------------------------------------------
-- listing.property_amenity — which amenities a property offers
-- (DEC-S1-01/H: the contract's amenities array, materialised).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.property_amenity (
    property_id uuid NOT NULL,
    amenity_id  uuid NOT NULL,
    CONSTRAINT property_amenity_pkey PRIMARY KEY (property_id, amenity_id),
    CONSTRAINT property_amenity_property_id_fkey
        FOREIGN KEY (property_id) REFERENCES listing.property (id),
    CONSTRAINT property_amenity_amenity_id_fkey
        FOREIGN KEY (amenity_id) REFERENCES listing.amenity (id)
);
CREATE INDEX IF NOT EXISTS property_amenity_amenity_id_idx
    ON listing.property_amenity (amenity_id);

-- ---------------------------------------------------------------------
-- listing.property_photo — display order and cover flag next to
-- media-owned bytes (DEC-S1-01/H). document_id is a logical reference
-- to media.document (no FK); position is unique within the property.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.property_photo (
    property_id  uuid        NOT NULL,
    document_id  uuid        NOT NULL,
    position     integer     NOT NULL,
    is_cover     boolean     NOT NULL DEFAULT false,
    created_at   timestamptz NOT NULL,
    CONSTRAINT property_photo_pkey PRIMARY KEY (property_id, document_id),
    CONSTRAINT property_photo_property_id_fkey
        FOREIGN KEY (property_id) REFERENCES listing.property (id),
    CONSTRAINT property_photo_position_key
        UNIQUE (property_id, position)
);

-- ---------------------------------------------------------------------
-- listing.unit — a rentable room (or group of identical rooms).
-- category is the optional P-02 grouping; quantity counts identical
-- units this row represents.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.unit (
    id          uuid        NOT NULL,
    property_id uuid        NOT NULL,
    name        varchar     NOT NULL,
    category    varchar,
    max_guests  integer     NOT NULL,
    quantity    integer     NOT NULL DEFAULT 1,
    created_at  timestamptz NOT NULL,
    updated_at  timestamptz NOT NULL,
    CONSTRAINT unit_pkey PRIMARY KEY (id),
    CONSTRAINT unit_property_id_fkey
        FOREIGN KEY (property_id) REFERENCES listing.property (id),
    CONSTRAINT unit_max_guests_check CHECK (max_guests > 0),
    CONSTRAINT unit_quantity_check CHECK (quantity > 0)
);
CREATE INDEX IF NOT EXISTS unit_property_id_idx ON listing.unit (property_id);

-- ---------------------------------------------------------------------
-- listing.rate_plan — the price lives HERE, one row per unit per
-- billing period (unique), so MONTHLY / PER_TERM / ACADEMIC_YEAR can
-- be switched on later without touching unit. Money is integer
-- pesewas; currency is always GHS (NFR-08).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.rate_plan (
    id                 uuid        NOT NULL,
    unit_id            uuid        NOT NULL,
    billing_period_id  uuid        NOT NULL,
    rate_pesewas       bigint      NOT NULL,
    currency           char(3)     NOT NULL DEFAULT 'GHS',
    created_at         timestamptz NOT NULL,
    updated_at         timestamptz NOT NULL,
    CONSTRAINT rate_plan_pkey PRIMARY KEY (id),
    CONSTRAINT rate_plan_unit_id_fkey
        FOREIGN KEY (unit_id) REFERENCES listing.unit (id),
    CONSTRAINT rate_plan_billing_period_id_fkey
        FOREIGN KEY (billing_period_id) REFERENCES listing.billing_period (id),
    CONSTRAINT rate_plan_unit_period_key
        UNIQUE (unit_id, billing_period_id),
    CONSTRAINT rate_plan_rate_pesewas_check CHECK (rate_pesewas >= 0),
    CONSTRAINT rate_plan_currency_check CHECK (currency = 'GHS')
);

-- ---------------------------------------------------------------------
-- listing.listing — the published public projection (1:1 with
-- property once published). Denormalised on purpose: anonymous
-- /properties/* reads go through here and here only. owner_verified
-- arrives by the VerificationApproved(orgId) event from verification
-- (the Verified Owner badge); from_price_pesewas is the lowest nightly
-- rate across the property's units, maintained on refresh.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.listing (
    id                        uuid         NOT NULL,
    property_id               uuid         NOT NULL,
    name                      varchar      NOT NULL,
    description               text         NOT NULL,
    town                      varchar      NOT NULL,
    area_name                 varchar,
    address                   varchar,
    latitude                  numeric(9,6),
    longitude                 numeric(9,6),
    accommodation_type_code   varchar      NOT NULL,
    amenities                 jsonb        NOT NULL,
    house_rules               text         NOT NULL,
    cover_photo_url           text,
    from_price_pesewas        bigint       NOT NULL,
    currency                  char(3)      NOT NULL DEFAULT 'GHS',
    owner_verified            boolean      NOT NULL DEFAULT false,
    status                    varchar(32)  NOT NULL,
    published_at              timestamptz  NOT NULL,
    updated_at                timestamptz  NOT NULL,
    CONSTRAINT listing_pkey PRIMARY KEY (id),
    CONSTRAINT listing_property_id_fkey
        FOREIGN KEY (property_id) REFERENCES listing.property (id),
    CONSTRAINT listing_property_id_key UNIQUE (property_id),
    CONSTRAINT listing_status_check
        CHECK (status IN ('ACTIVE', 'PAUSED', 'SUSPENDED')),
    CONSTRAINT listing_currency_check CHECK (currency = 'GHS')
);
-- The search set (ERD §4): status, town, area, price band, amenities
CREATE INDEX IF NOT EXISTS listing_status_idx
    ON listing.listing (status);
CREATE INDEX IF NOT EXISTS listing_town_idx
    ON listing.listing (town);
CREATE INDEX IF NOT EXISTS listing_area_name_idx
    ON listing.listing (area_name);
CREATE INDEX IF NOT EXISTS listing_from_price_pesewas_idx
    ON listing.listing (from_price_pesewas);
CREATE INDEX IF NOT EXISTS listing_amenities_gin_idx
    ON listing.listing USING gin (amenities);

-- ---------------------------------------------------------------------
-- listing.listing_status_history — every property transition, newest
-- first readable per property. from_status is NULL only on the first
-- row (app-maintained rule, ERD §4). actor_user_id is a logical
-- reference to identity.user_account (no FK).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS listing.listing_status_history (
    id             uuid        NOT NULL,
    property_id    uuid        NOT NULL,
    from_status    varchar(32),
    to_status      varchar(32) NOT NULL,
    actor_user_id  uuid        NOT NULL,
    reason         varchar(1000),
    created_at     timestamptz NOT NULL,
    CONSTRAINT listing_status_history_pkey PRIMARY KEY (id),
    CONSTRAINT listing_status_history_property_id_fkey
        FOREIGN KEY (property_id) REFERENCES listing.property (id)
);
CREATE INDEX IF NOT EXISTS listing_status_history_property_idx
    ON listing.listing_status_history (property_id, created_at DESC);
