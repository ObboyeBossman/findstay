import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getReviewStatusBadge,
  parseCorrectionLines,
  validateModerationReason,
  validateReviewDecision,
} from '../src/features/admin/validation.ts';

test('validateReviewDecision enforces mandatory written reasons on reject and corrections', () => {
  assert.equal(validateReviewDecision('APPROVE', '', []), null);
  assert.ok(validateReviewDecision('REJECT', '   ', [])?.includes('required'));
  assert.equal(validateReviewDecision('REJECT', 'Forged licence document', []), null);

  assert.ok(validateReviewDecision('REQUEST_CORRECTIONS', '', [])?.includes('Specify'));
  assert.equal(validateReviewDecision('REQUEST_CORRECTIONS', 'Upload clearer Ghana Card', []), null);
  assert.equal(
    validateReviewDecision('REQUEST_CORRECTIONS', '', ['Add exact check-in time']),
    null,
  );
});

test('validateModerationReason and parseCorrectionLines handle input cleanly', () => {
  assert.ok(validateModerationReason('   ')?.includes('mandatory'));
  assert.equal(validateModerationReason('Safety inspection pending'), null);
  assert.deepEqual(parseCorrectionLines(' Line 1 \n\n Line 2 \r\n'), ['Line 1', 'Line 2']);
  assert.equal(getReviewStatusBadge('ACTIVE').label, 'Published');
  assert.equal(getReviewStatusBadge('SUSPENDED').label, 'Suspended');
});
