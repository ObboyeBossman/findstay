-- =====================================================================
-- FindStay V1_13 — the starter reference lists (T15 seed values)
-- Task S1-01-T15 (issue #24). Structure came from V1_03 (T9); this
-- script owns the VALUES and nothing else.
--
-- Sources for every value (no value is invented here):
--   * Sprint 1 kickoff, 2026-11-16, confirmed decision 5 — the seven
--     accommodation types and the billing periods (Per Night active;
--     Per Month, Per Term, Academic Year seeded inactive; no weekly).
--     docs/meeting-notes/sprint-01-kickoff.md §3.
--   * Kickoff decision 1 (email verification links in R1; SMS OTP only
--     after the sender-ID approval) and decision 4 (In-App + Email
--     channels live first; the SMS adapter plugs in later) — both
--     recorded as off-by-default feature flags. Sprint rule C7: flags
--     ship dark.
--   * docs/design/erd.md §3.4 + §3.8 (platform_setting holds the
--     privacy policy version the S1-11 consent flow checks).
--     NFR-46 (owners/admins extend the lists by data, not code).
--
-- Rules this script obeys:
--   * Idempotent: ON CONFLICT DO NOTHING on every insert, so running it
--     again (fresh rebuild, partial restore, manual psql) never
--     duplicates a row (T15 checklist 4).
--   * Deterministic: fixed UUIDv7 ids (timestamp 2026-11-17T00:00:00Z,
--     sequential suffixes, same style as the V1_04 role seeds) and a
--     fixed updated_at, so every copy of the system starts byte-identical.
--   * Additive only; never edited once applied (V1_14+ changes values,
--     it never edits this file).
-- =====================================================================

-- ---------------------------------------------------------------------
-- listing.accommodation_type — the seven confirmed starter types, all
-- active (kickoff decision 5). Owners pick from these today and admins
-- add more rows later (NFR-46) — never by code change.
-- ---------------------------------------------------------------------
INSERT INTO listing.accommodation_type (id, code, name, is_active) VALUES
    ('01a1e6cd-a800-7001-bf00-000000000001', 'SINGLE_ROOM',         'Single Room',         true),
    ('01a1e6cd-a800-7002-bf00-000000000002', 'DOUBLE_ROOM',         'Double Room',         true),
    ('01a1e6cd-a800-7003-bf00-000000000003', 'STUDIO',              'Studio',              true),
    ('01a1e6cd-a800-7004-bf00-000000000004', 'SUITE',               'Suite',               true),
    ('01a1e6cd-a800-7005-bf00-000000000005', 'ONE_BEDROOM_APARTMENT', '1-Bedroom Apartment', true),
    ('01a1e6cd-a800-7006-bf00-000000000006', 'TWO_BEDROOM_APARTMENT', '2-Bedroom Apartment', true),
    ('01a1e6cd-a800-7007-bf00-000000000007', 'ENTIRE_HOUSE',        'Entire House',        true)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------
-- listing.billing_period — Per Night is the only Sprint 1 period
-- (active); Per Month, Per Term and Academic Year are seeded inactive
-- for the long-stay and hostel sprints (S4–S5). No WEEKLY, ever.
-- Codes match the names pinned in ERD §3.4 and V1_03's header.
-- ---------------------------------------------------------------------
INSERT INTO listing.billing_period (id, code, name, is_active) VALUES
    ('01a1e6cd-a800-7015-bf00-000000000015', 'NIGHTLY',       'Per Night',      true),
    ('01a1e6cd-a800-7016-bf00-000000000016', 'MONTHLY',       'Per Month',      false),
    ('01a1e6cd-a800-7017-bf00-000000000017', 'PER_TERM',      'Per Term',       false),
    ('01a1e6cd-a800-7018-bf00-000000000018', 'ACADEMIC_YEAR', 'Academic Year',  false)
ON CONFLICT (code) DO NOTHING;

-- ---------------------------------------------------------------------
-- admin.platform_setting — the starter settings every environment reads:
--   * privacy.policy_version: the Privacy Notice version the S1-11
--     consent records reference; starts at 1 and is bumped by admins
--     when the notice changes (S1-16 owns the settings screen).
--   * flag.auth.sms_otp: SMS OTP sign-in/confirmation (kickoff
--     decision 1) — email links are the R1 method, so the flag ships off.
--   * flag.notifications.sms: the SMS notification channel (kickoff
--     decision 4, P-08) — In-App + Email are live first, so the flag
--     ships off.
-- Off-by-default is the sprint rule for feature flags (C7).
-- updated_at is a fixed stamp (2026-11-17T00:00:00Z): identical on
-- every install; updated_by_user_id is NULL because no admin account
-- exists yet (the bootstrap admin arrives with S1-16 via environment
-- variables, kickoff decision 6 — SQL cannot provision a Supabase Auth
-- user, so it is deliberately not a seed row here).
-- ---------------------------------------------------------------------
INSERT INTO admin.platform_setting (key, value, description, is_feature_flag, updated_by_user_id, updated_at) VALUES
    ('privacy.policy_version', '1',
     'Privacy Notice version shown at registration; Act 843 consent records (S1-11) reference this version.',
     false, NULL, '2026-11-17T00:00:00Z'),
    ('flag.auth.sms_otp', 'false',
     'SMS OTP for sign-up confirmation and sign-in (kickoff decision 1). Email links are the R1 method; switch on only after the SMS sender-ID approval.',
     true, NULL, '2026-11-17T00:00:00Z'),
    ('flag.notifications.sms', 'false',
     'SMS notification channel (kickoff decision 4, P-08). In-App + Email are live first; the SMS adapter plugs in once credentials are confirmed.',
     true, NULL, '2026-11-17T00:00:00Z')
ON CONFLICT (key) DO NOTHING;
