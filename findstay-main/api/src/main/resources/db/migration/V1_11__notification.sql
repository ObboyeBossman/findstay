-- V1_11__notification.sql
-- Notification schema: in-app alerts, channel templates, and user notification preferences

CREATE SCHEMA IF NOT EXISTS notification;

-- Notification templates for channel rendering
CREATE TABLE IF NOT EXISTS notification.notification_template (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    subject_template TEXT,
    body_template TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_notification_template_event_channel UNIQUE (event_type, channel)
);

-- In-app notifications
CREATE TABLE IF NOT EXISTS notification.notification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX IF NOT EXISTS idx_notification_recipient_created 
    ON notification.notification (recipient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_recipient_unread 
    ON notification.notification (recipient_id) WHERE read_at IS NULL;

-- User notification preferences per event and channel
CREATE TABLE IF NOT EXISTS notification.notification_preference (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    email_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_enabled BOOLEAN NOT NULL DEFAULT false,
    in_app_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_notification_preference_user_event UNIQUE (user_id, event_type)
);

CREATE INDEX IF NOT EXISTS idx_notification_preference_user 
    ON notification.notification_preference (user_id);

-- Seed initial templates for Sprint 1 core events
INSERT INTO notification.notification_template (event_type, channel, subject_template, body_template)
VALUES
    ('VERIFICATION_STATUS_CHANGED', 'IN_APP', 'Verification Status Update', 'Your verification status has been updated to {{status}}. Review notes: {{notes}}'),
    ('VERIFICATION_STATUS_CHANGED', 'EMAIL', 'FindStay - Verification Status Update', 'Hello {{userName}}, your verification status is now {{status}}. {{notes}}'),
    ('LISTING_STATUS_CHANGED', 'IN_APP', 'Listing Status Update', 'Your listing {{listingTitle}} status has been changed to {{status}}.'),
    ('ACCOUNT_ACTIVITY', 'IN_APP', 'Account Security Alert', 'A new sign-in or security event was detected on your account.')
ON CONFLICT (event_type, channel) DO NOTHING;
