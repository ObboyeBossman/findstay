-- =====================================================================
-- FindStay V1_11 — notification module: inbox, templates, prefs, log
-- Task S1-01-T9 (issue #33), built from the approved ERD §3.7, §4.
-- Story owner of this module: S1-10 (email, SMS & in-app alerts).
--
-- Key facts (ERD §3.7):
--   * Templates are SEED DATA, not code (map §4.7 / module-boundaries
--     seam 4): new event types are a later V-migration insert, which
--     is why notification_template is a table. The seed values (the
--     T3 §8 notification-trigger matrix keys) belong to S1-10-T2's
--     own additive migration — this script creates the structure.
--   * user_id columns are logical references to identity.user_account
--     (ERD §5 row 16) — no FK.
--   * The in-app inbox IS the notification table (read_at NULL =
--     unread, driving the bell badge); delivery rows exist only for
--     OUTBOUND channels (EMAIL now, SMS later — channel CHECK on
--     notification_delivery allows exactly those two).
--   * notification_template.channel and notification_preference.
--     channel include IN_APP | EMAIL | SMS: preferences and templates
--     are per recipient × event type × channel.
-- =====================================================================

CREATE SCHEMA IF NOT EXISTS notification;

-- ---------------------------------------------------------------------
-- notification.notification — the in-app inbox row. data is the
-- optional deep-link payload (propertyId, verificationCaseId, ...)
-- the inbox routes on when tapped.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification.notification (
    id          uuid        NOT NULL,
    user_id     uuid        NOT NULL,
    event_type  varchar(64) NOT NULL,
    title       varchar     NOT NULL,
    body        text        NOT NULL,
    data        jsonb,
    read_at     timestamptz,
    created_at  timestamptz NOT NULL,
    CONSTRAINT notification_pkey PRIMARY KEY (id)
);
-- Inbox page: newest first per user
CREATE INDEX IF NOT EXISTS notification_user_idx
    ON notification.notification (user_id, created_at DESC);
-- The bell badge: count unread per user
CREATE INDEX IF NOT EXISTS notification_unread_idx
    ON notification.notification (user_id)
    WHERE read_at IS NULL;

-- ---------------------------------------------------------------------
-- notification.notification_template — one row per event type per
-- channel (map §4.7; seed values are S1-10-T2's migration).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification.notification_template (
    id              uuid        NOT NULL,
    event_type      varchar(64) NOT NULL,
    channel         varchar(16) NOT NULL,
    title_template  varchar     NOT NULL,
    body_template   text        NOT NULL,
    is_active       boolean     NOT NULL DEFAULT true,
    updated_at      timestamptz NOT NULL,
    CONSTRAINT notification_template_pkey PRIMARY KEY (id),
    CONSTRAINT notification_template_event_channel_key
        UNIQUE (event_type, channel),
    CONSTRAINT notification_template_channel_check
        CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS'))
);

-- ---------------------------------------------------------------------
-- notification.notification_preference — per recipient × event type ×
-- channel opt-in/out (the fan-out diagram's PREF node).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification.notification_preference (
    id          uuid        NOT NULL,
    user_id     uuid        NOT NULL,
    event_type  varchar(64) NOT NULL,
    channel     varchar(16) NOT NULL,
    enabled     boolean     NOT NULL DEFAULT true,
    updated_at  timestamptz NOT NULL,
    CONSTRAINT notification_preference_pkey PRIMARY KEY (id),
    CONSTRAINT notification_preference_user_event_channel_key
        UNIQUE (user_id, event_type, channel),
    CONSTRAINT notification_preference_channel_check
        CHECK (channel IN ('IN_APP', 'EMAIL', 'SMS'))
);
CREATE INDEX IF NOT EXISTS notification_preference_user_idx
    ON notification.notification_preference (user_id);

-- ---------------------------------------------------------------------
-- notification.notification_delivery — the outbound delivery log with
-- retry state (S1-10-T7: failed deliveries retry via next_retry_at).
-- attempts is incremented per try by the app.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notification.notification_delivery (
    id                    uuid        NOT NULL,
    notification_id       uuid        NOT NULL,
    channel               varchar(16) NOT NULL,
    status                varchar(32) NOT NULL DEFAULT 'QUEUED',
    attempts              integer     NOT NULL DEFAULT 0,
    last_attempt_at       timestamptz,
    next_retry_at         timestamptz,
    provider_message_id   varchar,
    last_error            text,
    created_at            timestamptz NOT NULL,
    updated_at            timestamptz NOT NULL,
    CONSTRAINT notification_delivery_pkey PRIMARY KEY (id),
    CONSTRAINT notification_delivery_notification_id_fkey
        FOREIGN KEY (notification_id)
        REFERENCES notification.notification (id),
    CONSTRAINT notification_delivery_channel_check
        CHECK (channel IN ('EMAIL', 'SMS')),
    CONSTRAINT notification_delivery_status_check
        CHECK (status IN ('QUEUED', 'SENT', 'FAILED'))
);
-- The retry job's queue: due failures, oldest first
CREATE INDEX IF NOT EXISTS notification_delivery_retry_idx
    ON notification.notification_delivery (status, next_retry_at);
