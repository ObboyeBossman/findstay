import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateSubmissionChecklist,
  formatGhsPesewas,
  parseCedisToPesewas,
  pesewasToCedisInput,
} from '../src/features/listing/pricing.ts';

test('parseCedisToPesewas converts GHS strings to exact integer pesewas without float drift', () => {
  assert.equal(parseCedisToPesewas('450.50'), 45050);
  assert.equal(parseCedisToPesewas('19.99'), 1999);
  assert.equal(parseCedisToPesewas('320'), 32000);
  assert.equal(parseCedisToPesewas('12.5'), 1250);
  assert.equal(parseCedisToPesewas('0'), null);
  assert.equal(parseCedisToPesewas('-50'), null);
  assert.equal(parseCedisToPesewas('12.345'), null);
  assert.equal(parseCedisToPesewas('abc'), null);
});

test('pesewasToCedisInput and formatGhsPesewas format GHS amounts consistently', () => {
  assert.equal(pesewasToCedisInput(45050), '450.50');
  assert.equal(pesewasToCedisInput(100), '1.00');
  assert.equal(formatGhsPesewas(45050), 'GH₵450.50');
  assert.equal(formatGhsPesewas(125000), 'GH₵1,250.00');
  assert.equal(formatGhsPesewas(null), 'Price not set');
});

test('evaluateSubmissionChecklist flags missing fields and passes when complete', () => {
  const incomplete = evaluateSubmissionChecklist({
    description: '',
    areaId: null,
    address: '',
    houseRules: '',
    units: [],
    photos: [],
  });
  assert.equal(incomplete.filter((i) => !i.complete).length, 6);

  const complete = evaluateSubmissionChecklist({
    description: 'Ocean-view suite in Beach Road.',
    areaId: '01a1e6cd-a818-7001-bf00-000000000001',
    address: '14 Beach Road, Takoradi',
    houseRules: 'Check-in 14:00, check-out 11:00.',
    units: [{ maxGuests: 2, nightlyRatePesewas: 45050 }],
    photos: [{ documentId: 'doc-1' }],
  });
  assert.equal(complete.every((i) => i.complete), true);
});
