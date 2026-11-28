import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildAuditSearchParams,
  extractAuditReason,
  formatAuditGhanaTime,
  getAuditActionMeta,
} from '../src/features/audit/format.ts';

test('buildAuditSearchParams validates UUID/dates and maps Ghana day bounds to UTC', () => {
  const ok = buildAuditSearchParams({
    actorId: '01a1e6cd-a818-7001-bf00-000000000001',
    action: 'user.suspended',
    entityType: 'USER',
    fromDate: '2026-11-20',
    toDate: '2026-11-25',
    limit: 20,
    offset: 40,
  });
  assert.equal(ok.error, null);
  assert.equal(ok.params.get('from'), '2026-11-20T00:00:00Z');
  assert.equal(ok.params.get('to'), '2026-11-25T23:59:59.999Z');
  assert.equal(ok.params.get('limit'), '20');
  assert.equal(ok.params.get('offset'), '40');

  const badUuid = buildAuditSearchParams({ actorId: 'not-a-uuid' });
  assert.ok(badUuid.error?.includes('UUID'));

  const invertedDates = buildAuditSearchParams({
    fromDate: '2026-11-25',
    toDate: '2026-11-20',
  });
  assert.ok(invertedDates.error?.includes('after start date'));
});

test('extractAuditReason, formatAuditGhanaTime, and getAuditActionMeta format audit entries', () => {
  assert.equal(extractAuditReason({ reason: 'Policy violation' }), 'Policy violation');
  assert.equal(extractAuditReason({ notes: 'Fix photo lighting' }), 'Fix photo lighting');
  assert.equal(extractAuditReason({}), null);

  assert.ok(formatAuditGhanaTime('2026-11-28T17:30:00Z').endsWith('GMT'));
  assert.equal(formatAuditGhanaTime(null), '—');

  assert.equal(getAuditActionMeta('listing.approved').label, 'Listing Approved');
  assert.ok(getAuditActionMeta('user.suspended').toneClass.includes('status-error'));
});
