-- =====================================================================
-- FindStay V1_05 — organization module: companies, memberships, invites
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.2, §4.
-- Story owner of this module: S1-07 (owner companies & staff access).
--
-- Key facts (ERD §3.2):
--   * membership.user_id and invitation.invited_by_user_id /
--     accepted_by_user_id are LOGICAL references to
--     identity.user_account — plain uuid columns, NO FK (the Modulith
--     boundary rule C5/C6; ERD §5 register rows 1 and 3).
--   * membership_permission.property_id and invitation_property.
--     property_id are logical references to listing.property (ERD §5
--     rows 2 and 4) — also plain uuid columns.
--   * invitation (DEC-S1-01/H) holds pre-acceptance staff invites:
--     the invitee has no user_id until they accept, so membership
--     cannot hold them. The acceptance token is stored HASHED
--     (SHA-256, char(64)); the raw token lives only in the email link.
--   * organization.verification_status is a denormalised column
--     maintained by the case-decided event from verification (ERD §5).
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS organization;

-- ---------------------------------------------------------------------
-- organization.organization — the owner company (S1-07).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization.organization (
    id                   uuid        NOT NULL,
    name                 varchar     NOT NULL,
    display_name         varchar     NOT NULL,
    contact_email        varchar     NOT NULL,
    contact_phone        varchar(20),
    verification_status  varchar     NOT NULL DEFAULT 'NOT_SUBMITTED',
    created_at           timestamptz NOT NULL,
    updated_at           timestamptz NOT NULL,
    CONSTRAINT organization_pkey PRIMARY KEY (id),
    CONSTRAINT organization_verification_status_check
        CHECK (verification_status IN
            ('NOT_SUBMITTED', 'PENDING', 'PARTIALLY_REJECTED', 'REJECTED', 'APPROVED'))
);
-- Onboarding-state screening (owner dashboard reads this constantly)
CREATE INDEX IF NOT EXISTS organization_verification_status_idx
    ON organization.organization (verification_status);

-- ---------------------------------------------------------------------
-- organization.membership — who belongs to which company at which
-- level. Org-level roles (OWNER | STAFF) live HERE, not in identity:
-- one person can be OWNER in one company and STAFF in another.
-- user_id is a logical reference to identity.user_account (no FK).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization.membership (
    id               uuid        NOT NULL,
    organization_id  uuid        NOT NULL,
    user_id          uuid        NOT NULL,
    role             varchar     NOT NULL,
    is_primary_owner boolean     NOT NULL DEFAULT false,
    joined_at        timestamptz NOT NULL,
    CONSTRAINT membership_pkey PRIMARY KEY (id),
    CONSTRAINT membership_organization_id_fkey
        FOREIGN KEY (organization_id) REFERENCES organization.organization (id),
    CONSTRAINT membership_organization_user_key
        UNIQUE (organization_id, user_id),
    CONSTRAINT membership_role_check CHECK (role IN ('OWNER', 'STAFF'))
);
-- The OrgScope hot path: resolve memberships per request by user_id
CREATE INDEX IF NOT EXISTS membership_user_id_idx
    ON organization.membership (user_id);

-- ---------------------------------------------------------------------
-- organization.membership_permission — which properties a STAFF
-- membership may work on. property_id is a logical reference to
-- listing.property (no FK; ERD §5 row 2). Composite PK.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization.membership_permission (
    membership_id  uuid NOT NULL,
    property_id    uuid NOT NULL,
    CONSTRAINT membership_permission_pkey PRIMARY KEY (membership_id, property_id),
    CONSTRAINT membership_permission_membership_id_fkey
        FOREIGN KEY (membership_id) REFERENCES organization.membership (id)
);
CREATE INDEX IF NOT EXISTS membership_permission_property_id_idx
    ON organization.membership_permission (property_id);

-- ---------------------------------------------------------------------
-- organization.invitation — a pending staff invite, before the invitee
-- has an account (DEC-S1-01/H). status expires via the sweep job
-- (expires_at index). token_hash is unique: one live token per invite.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization.invitation (
    id                   uuid        NOT NULL,
    organization_id      uuid        NOT NULL,
    email                varchar     NOT NULL,
    role                 varchar     NOT NULL,
    status               varchar     NOT NULL DEFAULT 'PENDING',
    token_hash           char(64)    NOT NULL,
    invited_by_user_id   uuid        NOT NULL,
    expires_at           timestamptz NOT NULL,
    accepted_at          timestamptz,
    accepted_by_user_id  uuid,
    created_at           timestamptz NOT NULL,
    CONSTRAINT invitation_pkey PRIMARY KEY (id),
    CONSTRAINT invitation_organization_id_fkey
        FOREIGN KEY (organization_id) REFERENCES organization.organization (id),
    CONSTRAINT invitation_token_hash_key UNIQUE (token_hash),
    CONSTRAINT invitation_status_check
        CHECK (status IN ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED')),
    CONSTRAINT invitation_role_check CHECK (role = 'STAFF')
);
-- One open invite per email per organisation (ERD §4, review item 3)
CREATE UNIQUE INDEX IF NOT EXISTS invitation_open_email_key
    ON organization.invitation (organization_id, email)
    WHERE status = 'PENDING';
-- The expiry sweep job scans for due invitations
CREATE INDEX IF NOT EXISTS invitation_expires_at_idx
    ON organization.invitation (expires_at);

-- ---------------------------------------------------------------------
-- organization.invitation_property — which properties an invitation
-- will grant once accepted; mirrors membership_permission for the
-- pending state. property_id is a logical reference to
-- listing.property (no FK; ERD §5 row 4). Composite PK.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization.invitation_property (
    invitation_id  uuid NOT NULL,
    property_id    uuid NOT NULL,
    CONSTRAINT invitation_property_pkey PRIMARY KEY (invitation_id, property_id),
    CONSTRAINT invitation_property_invitation_id_fkey
        FOREIGN KEY (invitation_id) REFERENCES organization.invitation (id)
);
CREATE INDEX IF NOT EXISTS invitation_property_property_id_idx
    ON organization.invitation_property (property_id);
