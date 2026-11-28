import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatConsentGhanaTime,
  isConsentCurrent,
} from '../src/features/verification/consentHelpers.ts';

test('isConsentCurrent detects pending vs accepted Act 843 consent', () => {
  assert.equal(isConsentCurrent(null), false);
  assert.equal(
    isConsentCurrent({ policyVersion: '1', acceptedAt: null, requiresConsent: true }),
    false,
  );
  assert.equal(
    isConsentCurrent({
      policyVersion: '1',
      acceptedAt: '2026-11-28T18:00:00Z',
      requiresConsent: false,
    }),
    true,
  );
});

test('formatConsentGhanaTime formats UTC timestamps in Ghana GMT', () => {
  assert.equal(formatConsentGhanaTime(null), 'Not recorded yet');
  assert.ok(formatConsentGhanaTime('2026-11-28T18:00:00Z').endsWith('GMT'));
});
