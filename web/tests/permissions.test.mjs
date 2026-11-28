import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canAccessAdminPortal,
  canAccessOwnerPortal,
  filterNavItems,
  getEffectiveRole,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  hasRole,
  meetsAccessRequirement,
} from '../src/features/identity/permissions.ts';

function makeContext(role, permissions, memberships = []) {
  return {
    profile: {
      id: '01950000-0000-7000-8000-000000000001',
      fullName: 'Test User',
      email: 'test@findstay.com',
      phone: '+233241234567',
      avatarUrl: null,
      preferredLanguage: 'en',
      createdAt: '2026-11-20T00:00:00Z',
    },
    memberships,
    consent: { policyVersion: '1', acceptedAt: null },
    activeOrganizationId: memberships[0]?.organizationId ?? null,
    role,
    permissions,
  };
}

const GUEST_CTX = makeContext('GUEST', [
  'profile.read',
  'profile.write',
  'notification.read',
  'notification.write',
  'consent.read',
  'consent.write',
]);

const OWNER_CTX = makeContext(
  'OWNER',
  [
    'profile.read',
    'profile.write',
    'notification.read',
    'org.read',
    'org.write',
    'org.staff.manage',
    'verification.read',
    'verification.submit',
    'listing.read',
    'listing.write',
    'listing.submit',
    'availability.read',
    'availability.write',
    'media.upload',
  ],
  [{ role: 'OWNER', organizationId: 'org-1', organizationName: 'Takoradi Suites' }],
);

const STAFF_CTX = makeContext(
  'STAFF',
  [
    'profile.read',
    'profile.write',
    'notification.read',
    'org.read',
    'listing.read',
    'listing.write',
    'listing.submit',
    'availability.read',
    'availability.write',
    'media.upload',
  ],
  [{ role: 'STAFF', organizationId: 'org-1', organizationName: 'Takoradi Suites' }],
);

const ADMIN_CTX = makeContext('ADMIN', [
  'profile.read',
  'profile.write',
  'notification.read',
  'admin.dashboard.read',
  'admin.review.read',
  'admin.review.decide',
  'admin.user.read',
  'admin.user.manage',
  'admin.listing.moderate',
  'admin.setting.read',
  'admin.setting.write',
  'admin.audit.read',
  'media.private.read',
]);

const OWNER_NAV = [
  { to: '/owner', requiredRoles: ['OWNER', 'STAFF'] },
  { to: '/owner/listings', requiredPermissions: ['listing.read'] },
  { to: '/owner/verification', requiredPermissions: ['verification.read'] },
  { to: '/owner/calendar', requiredPermissions: ['availability.read'] },
  { to: '/owner/org', requiredPermissions: ['org.staff.manage'] },
];

const ADMIN_NAV = [
  { to: '/admin', requiredPermissions: ['admin.dashboard.read'] },
  { to: '/admin/reviews', requiredPermissions: ['admin.review.read'] },
  { to: '/admin/users', requiredPermissions: ['admin.user.read'] },
  { to: '/admin/settings', requiredPermissions: ['admin.setting.read'] },
  { to: '/admin/audit', requiredPermissions: ['admin.audit.read'] },
];

test('anonymous (null) context is blocked from owner/admin portals and protected nav items', () => {
  assert.equal(getEffectiveRole(null), null);
  assert.equal(canAccessOwnerPortal(null), false);
  assert.equal(canAccessAdminPortal(null), false);
  assert.deepEqual(filterNavItems(OWNER_NAV, null), []);
  assert.deepEqual(filterNavItems(ADMIN_NAV, null), []);
});

test('GUEST cannot enter Owner or Admin portals and sees no restricted menu items', () => {
  assert.equal(getEffectiveRole(GUEST_CTX), 'GUEST');
  assert.equal(canAccessOwnerPortal(GUEST_CTX), false);
  assert.equal(canAccessAdminPortal(GUEST_CTX), false);
  assert.equal(hasPermission(GUEST_CTX, 'profile.read'), true);
  assert.equal(hasPermission(GUEST_CTX, 'admin.dashboard.read'), false);
  assert.deepEqual(filterNavItems(OWNER_NAV, GUEST_CTX), []);
  assert.deepEqual(filterNavItems(ADMIN_NAV, GUEST_CTX), []);
});

test('OWNER accesses all Owner Portal items and is denied Admin Portal', () => {
  assert.equal(getEffectiveRole(OWNER_CTX), 'OWNER');
  assert.equal(canAccessOwnerPortal(OWNER_CTX), true);
  assert.equal(canAccessAdminPortal(OWNER_CTX), false);
  assert.deepEqual(
    filterNavItems(OWNER_NAV, OWNER_CTX).map((i) => i.to),
    ['/owner', '/owner/listings', '/owner/verification', '/owner/calendar', '/owner/org'],
  );
  assert.deepEqual(filterNavItems(ADMIN_NAV, OWNER_CTX), []);
});

test('STAFF sees day-to-day property menus but is blocked from Verification, Team & Org, and Admin', () => {
  assert.equal(getEffectiveRole(STAFF_CTX), 'STAFF');
  assert.equal(canAccessOwnerPortal(STAFF_CTX), true);
  assert.equal(canAccessAdminPortal(STAFF_CTX), false);
  assert.deepEqual(
    filterNavItems(OWNER_NAV, STAFF_CTX).map((i) => i.to),
    ['/owner', '/owner/listings', '/owner/calendar'],
  );
  assert.equal(
    meetsAccessRequirement(STAFF_CTX, { requiredPermissions: ['verification.read'] }),
    false,
  );
  assert.equal(
    meetsAccessRequirement(STAFF_CTX, { requiredPermissions: ['org.staff.manage'] }),
    false,
  );
  assert.deepEqual(filterNavItems(ADMIN_NAV, STAFF_CTX), []);
});

test('ADMIN with empty memberships accesses all Admin Portal routes and is denied Owner Portal', () => {
  assert.equal(getEffectiveRole(ADMIN_CTX), 'ADMIN');
  assert.equal(hasRole(ADMIN_CTX, ['ADMIN']), true);
  assert.equal(canAccessAdminPortal(ADMIN_CTX), true);
  assert.equal(canAccessOwnerPortal(ADMIN_CTX), false);
  assert.deepEqual(
    filterNavItems(ADMIN_NAV, ADMIN_CTX).map((i) => i.to),
    ['/admin', '/admin/reviews', '/admin/users', '/admin/settings', '/admin/audit'],
  );
  assert.deepEqual(filterNavItems(OWNER_NAV, ADMIN_CTX), []);
});

test('requireAllPermissions enforces every permission vs any permission', () => {
  assert.equal(hasAnyPermission(STAFF_CTX, ['listing.write', 'org.staff.manage']), true);
  assert.equal(hasAllPermissions(STAFF_CTX, ['listing.write', 'org.staff.manage']), false);
  assert.equal(
    meetsAccessRequirement(STAFF_CTX, {
      requiredPermissions: ['listing.write', 'org.staff.manage'],
      requireAllPermissions: true,
    }),
    false,
  );
  assert.equal(
    meetsAccessRequirement(OWNER_CTX, {
      requiredPermissions: ['listing.write', 'org.staff.manage'],
      requireAllPermissions: true,
    }),
    true,
  );
});
