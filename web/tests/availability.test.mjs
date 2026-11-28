import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  buildMondayFirstGrid,
  isDateInSelection,
  shiftMonth,
  validateBlockDateRange,
} from '../src/features/availability/calendar.ts';

test('shiftMonth handles year rollovers cleanly', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2027-01', -1), '2026-12');
  assert.equal(shiftMonth('2026-06', 2), '2026-08');
});

test('validateBlockDateRange enforces startDate < endDate and computes night count', () => {
  assert.deepEqual(validateBlockDateRange('2026-12-05', '2026-12-10'), {
    valid: true,
    nights: 5,
  });
  assert.equal(validateBlockDateRange('2026-12-10', '2026-12-10').valid, false);
  assert.equal(validateBlockDateRange('2026-12-12', '2026-12-10').valid, false);
  assert.equal(validateBlockDateRange('', '2026-12-10').valid, false);
});

test('buildMondayFirstGrid pads leading blanks and isDateInSelection uses half-open ranges', () => {
  // 2026-12-01 is a Tuesday -> 1 leading blank (Monday)
  const grid = buildMondayFirstGrid('2026-12', [
    { date: '2026-12-01', state: 'AVAILABLE', blockId: null },
    { date: '2026-12-02', state: 'OWNER_BLOCKED', blockId: 'b1' },
  ]);
  assert.equal(grid[0], null);
  assert.equal(grid[1]?.date, '2026-12-01');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');

  assert.equal(isDateInSelection('2026-12-05', '2026-12-05', '2026-12-08'), true);
  assert.equal(isDateInSelection('2026-12-07', '2026-12-05', '2026-12-08'), true);
  assert.equal(isDateInSelection('2026-12-08', '2026-12-05', '2026-12-08'), false);
});
