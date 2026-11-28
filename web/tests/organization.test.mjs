import assert from 'node:assert/strict';
import test from 'node:test';

// Re-test the pure helper logic directly without Vite import.meta.env
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function parsePropertyIdList(raw) {
  const parts = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ids = [];
  const invalid = [];
  const seen = new Set();
  for (const part of parts) {
    if (UUID_PATTERN.test(part)) {
      const normalized = part.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        ids.push(normalized);
      }
    } else {
      invalid.push(part);
    }
  }
  return { ids, invalid };
}

test('parsePropertyIdList deduplicates valid UUIDs and flags malformed entries', () => {
  const id1 = '01950000-0000-7000-8000-000000000001';
  const id2 = '01950000-0000-7000-8000-000000000002';
  const result = parsePropertyIdList(`${id1.toUpperCase()}, ${id2}\n${id1} not-a-uuid`);
  assert.deepEqual(result.ids, [id1, id2]);
  assert.deepEqual(result.invalid, ['not-a-uuid']);
});

test('parsePropertyIdList handles empty input cleanly', () => {
  assert.deepEqual(parsePropertyIdList('   ,  \n '), { ids: [], invalid: [] });
});
