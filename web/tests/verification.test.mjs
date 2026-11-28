import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMissingResubmissionTypes,
  isValidGhanaCardNumber,
  maskGhanaCardNumber,
  normalizeGhanaCardNumber,
} from '../src/features/verification/validation.ts';

test('Ghana Card format validation and masking follow GHA-XXXXXXXXX-X rules', () => {
  assert.equal(normalizeGhanaCardNumber(' gha-123456789-5 '), 'GHA-123456789-5');
  assert.equal(isValidGhanaCardNumber('GHA-123456789-5'), true);
  assert.equal(isValidGhanaCardNumber('gha-000111222-9'), true);
  assert.equal(isValidGhanaCardNumber('GHA-12345-5'), false);
  assert.equal(isValidGhanaCardNumber('123456789'), false);
  assert.equal(maskGhanaCardNumber('GHA-123456789-5'), 'GHA-******789-5');
});

test('getMissingResubmissionTypes requires replacements for every REJECTED document', () => {
  const existing = [
    { documentType: 'GHANA_CARD', status: 'APPROVED' },
    { documentType: 'OWNERSHIP_PROOF', status: 'REJECTED' },
    { documentType: 'GTA_LICENCE', status: 'REJECTED' },
  ];

  assert.deepEqual(getMissingResubmissionTypes(existing, {}), [
    'OWNERSHIP_PROOF',
    'GTA_LICENCE',
  ]);
  assert.deepEqual(
    getMissingResubmissionTypes(existing, { OWNERSHIP_PROOF: { assetId: '1' } }),
    ['GTA_LICENCE'],
  );
  assert.deepEqual(
    getMissingResubmissionTypes(existing, {
      OWNERSHIP_PROOF: { assetId: '1' },
      GTA_LICENCE: { assetId: '2' },
    }),
    [],
  );
});
