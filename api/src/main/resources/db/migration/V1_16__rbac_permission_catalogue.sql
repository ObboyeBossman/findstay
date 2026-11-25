-- =====================================================================
-- V1_16 — S1-06-T1: permission catalogue and role-to-permission mappings.
--
-- Additive and idempotent (ON CONFLICT DO NOTHING): V1_04 created the
-- tables and the four roles; this migration seeds the codes that the
-- @RequiresPermission guard checks against identity.role_permission.
--
-- Codes are module-prefixed (module-boundaries.md seam 6). Mappings are
-- resolved by role code and permission code, so no UUIDs are repeated.
-- =====================================================================

INSERT INTO identity.permission (id, code, description) VALUES
    ('01a16016-0000-7001-8000-000000000001', 'identity.profile.write',       'Edit own profile (name, phone, avatar)'),
    ('01a16016-0000-7002-8000-000000000002', 'listing.read',                 'Read properties the caller can manage'),
    ('01a16016-0000-7003-8000-000000000003', 'listing.write',                'Create and edit properties and rooms'),
    ('01a16016-0000-7004-8000-000000000004', 'availability.write',           'Change availability calendars and rates'),
    ('01a16016-0000-7005-8000-000000000005', 'organization.staff.manage',    'Invite staff and grant or revoke property permissions'),
    ('01a16016-0000-7006-8000-000000000006', 'admin.review.decide',          'Approve or reject verification and listing reviews'),
    ('01a16016-0000-7007-8000-000000000007', 'admin.platform_setting.write', 'Change platform settings and feature flags'),
    ('01a16016-0000-7008-8000-000000000008', 'audit.read',                   'Read the audit log')
ON CONFLICT (code) DO NOTHING;

INSERT INTO identity.role_permission (role_id, permission_id)
SELECT r.id, p.id
FROM (VALUES
    ('GUEST', 'identity.profile.write'),

    ('OWNER', 'identity.profile.write'),
    ('OWNER', 'listing.read'),
    ('OWNER', 'listing.write'),
    ('OWNER', 'availability.write'),
    ('OWNER', 'organization.staff.manage'),

    ('STAFF', 'identity.profile.write'),
    ('STAFF', 'listing.read'),
    ('STAFF', 'listing.write'),
    ('STAFF', 'availability.write'),

    ('ADMIN', 'identity.profile.write'),
    ('ADMIN', 'listing.read'),
    ('ADMIN', 'admin.review.decide'),
    ('ADMIN', 'admin.platform_setting.write'),
    ('ADMIN', 'audit.read')
) AS m (role_code, permission_code)
JOIN identity.role r ON r.code = m.role_code
JOIN identity.permission p ON p.code = m.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;
