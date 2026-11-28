import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBadgeCount, formatEventLabel } from '../src/features/notification/formatters.ts';

test('formatBadgeCount hides zero/negative and caps at 99+', () => {
  assert.equal(formatBadgeCount(0), null);
  assert.equal(formatBadgeCount(-2), null);
  assert.equal(formatBadgeCount(1), '1');
  assert.equal(formatBadgeCount(42), '42');
  assert.equal(formatBadgeCount(99), '99');
  assert.equal(formatBadgeCount(100), '99+');
  assert.equal(formatBadgeCount(999), '99+');
});

test('formatEventLabel returns human labels for Sprint 1 lifecycle events and title-cases unknown keys', () => {
  assert.equal(formatEventLabel('VERIFICATION_APPROVED'), 'Verification Approved');
  assert.equal(formatEventLabel('LISTING_CHANGES_REQUESTED'), 'Listing Changes Requested');
  assert.equal(formatEventLabel('STAFF_INVITED'), 'Team Invitation');
  assert.equal(formatEventLabel('CUSTOM_FUTURE_EVENT'), 'Custom Future Event');
});
