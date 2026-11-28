-- =====================================================================
-- V1_16 — S1-06-T1: permission catalogue and role-to-permission mappings.
--
-- Additive and idempotent: V1_04 created identity.role, identity.permission
-- and identity.role_permission and seeded the four roles with the fixed ids
-- pinned there (GUEST ...0001, OWNER ...0002, STAFF ...0003, ADMIN ...0004).
-- Re-running this script inserts nothing new (ON CONFLICT DO NOTHING).
--
-- Codes are module-prefixed (module.action). Mappings are resolved by role
-- code and permission code, so the role ids are never repeated here.
--
-- Per-property staff overrides are NOT here: they live in
-- organization.membership_permission (S1-07).
-- =====================================================================

INSERT INTO identity.permission (id, code, description) VALUES
    -- All authenticated roles
    ('01a16016-0000-7001-8000-000000000001', 'profile.read',           'Read own profile'),
    ('01a16016-0000-7002-8000-000000000002', 'profile.write',          'Edit own profile'),
    ('01a16016-0000-7003-8000-000000000003', 'notification.read',      'Read own notifications'),
    ('01a16016-0000-7004-8000-000000000004', 'notification.write',     'Manage own notification preferences'),
    ('01a16016-0000-7005-8000-000000000005', 'consent.read',           'Read own consent records'),
    ('01a16016-0000-7006-8000-000000000006', 'consent.write',          'Give or withdraw own consent'),
    -- Owner and staff
    ('01a16016-0000-7007-8000-000000000007', 'org.read',               'Read the organisation'),
    ('01a16016-0000-7008-8000-000000000008', 'org.write',              'Edit the organisation'),
    ('01a16016-0000-7009-8000-000000000009', 'org.staff.manage',       'Invite staff and manage their permissions'),
    ('01a16016-0000-700a-8000-00000000000a', 'verification.read',      'Read own verification case'),
    ('01a16016-0000-700b-8000-00000000000b', 'verification.submit',    'Submit verification documents'),
    ('01a16016-0000-700c-8000-00000000000c', 'listing.read',           'Read properties and rooms'),
    ('01a16016-0000-700d-8000-00000000000d', 'listing.write',          'Create and edit properties and rooms'),
    ('01a16016-0000-700e-8000-00000000000e', 'listing.submit',         'Submit listings for review'),
    ('01a16016-0000-700f-8000-00000000000f', 'availability.read',      'Read availability calendars'),
    ('01a16016-0000-7010-8000-000000000010', 'availability.write',     'Change availability and prices'),
    ('01a16016-0000-7011-8000-000000000011', 'media.upload',           'Upload property photos and documents'),
    -- Administrators only
    ('01a16016-0000-7012-8000-000000000012', 'admin.dashboard.read',   'View the admin dashboard'),
    ('01a16016-0000-7013-8000-000000000013', 'admin.review.read',      'View verification and listing reviews'),
    ('01a16016-0000-7014-8000-000000000014', 'admin.review.decide',    'Approve or reject reviews'),
    ('01a16016-0000-7015-8000-000000000015', 'admin.user.read',        'View user accounts'),
    ('01a16016-0000-7016-8000-000000000016', 'admin.user.manage',      'Suspend or change user accounts'),
    ('01a16016-0000-7017-8000-000000000017', 'admin.listing.moderate', 'Suspend or restore listings'),
    ('01a16016-0000-7018-8000-000000000018', 'admin.setting.read',     'View platform settings'),
    ('01a16016-0000-7019-8000-000000000019', 'admin.setting.write',    'Change platform settings'),
    ('01a16016-0000-701a-8000-00000000001a', 'admin.audit.read',       'Read the audit log'),
    ('01a16016-0000-701b-8000-00000000001b', 'media.private.read',     'Read private documents (pre-signed access)')
ON CONFLICT (code) DO NOTHING;

INSERT INTO identity.role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM (VALUES
    -- GUEST: the baseline every authenticated person holds
    ('GUEST', 'profile.read'),
    ('GUEST', 'profile.write'),
    ('GUEST', 'notification.read'),
    ('GUEST', 'notification.write'),
    ('GUEST', 'consent.read'),
    ('GUEST', 'consent.write'),

    -- OWNER: baseline plus full owner-side access
    ('OWNER', 'profile.read'),
    ('OWNER', 'profile.write'),
    ('OWNER', 'notification.read'),
    ('OWNER', 'notification.write'),
    ('OWNER', 'consent.read'),
    ('OWNER', 'consent.write'),
    ('OWNER', 'org.read'),
    ('OWNER', 'org.write'),
    ('OWNER', 'org.staff.manage'),
    ('OWNER', 'verification.read'),
    ('OWNER', 'verification.submit'),
    ('OWNER', 'listing.read'),
    ('OWNER', 'listing.write'),
    ('OWNER', 'listing.submit'),
    ('OWNER', 'availability.read'),
    ('OWNER', 'availability.write'),
    ('OWNER', 'media.upload'),

    -- STAFF: baseline plus day-to-day property work; no org or verification rights
    ('STAFF', 'profile.read'),
    ('STAFF', 'profile.write'),
    ('STAFF', 'notification.read'),
    ('STAFF', 'notification.write'),
    ('STAFF', 'consent.read'),
    ('STAFF', 'consent.write'),
    ('STAFF', 'org.read'),
    ('STAFF', 'listing.read'),
    ('STAFF', 'listing.write'),
    ('STAFF', 'listing.submit'),
    ('STAFF', 'availability.read'),
    ('STAFF', 'availability.write'),
    ('STAFF', 'media.upload'),

    -- ADMIN: baseline plus the admin.* and private-document rights
    ('ADMIN', 'profile.read'),
    ('ADMIN', 'profile.write'),
    ('ADMIN', 'notification.read'),
    ('ADMIN', 'notification.write'),
    ('ADMIN', 'consent.read'),
    ('ADMIN', 'consent.write'),
    ('ADMIN', 'admin.dashboard.read'),
    ('ADMIN', 'admin.review.read'),
    ('ADMIN', 'admin.review.decide'),
    ('ADMIN', 'admin.user.read'),
    ('ADMIN', 'admin.user.manage'),
    ('ADMIN', 'admin.listing.moderate'),
    ('ADMIN', 'admin.setting.read'),
    ('ADMIN', 'admin.setting.write'),
    ('ADMIN', 'admin.audit.read'),
    ('ADMIN', 'media.private.read')
) AS m (role_code, permission_code)
JOIN identity.role r ON r.code = m.role_code
JOIN identity.permission p ON p.code = m.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;
