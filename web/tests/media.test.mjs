import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatBytes,
  isSignedUrlExpired,
  MAX_UPLOAD_BYTES,
  reorderPhotos,
  setCoverPhoto,
  validateMediaFile,
} from '../src/features/media/validation.ts';

test('validateMediaFile enforces 5 MB limit and MIME rules per ownerType', () => {
  // Valid WebP photo under 5 MB
  assert.deepEqual(
    validateMediaFile({ name: 'room.webp', type: 'image/webp', size: 250_000 }, 'PROPERTY_PHOTO'),
    { valid: true },
  );

  // Oversize (> 5 MB) rejected
  const oversize = validateMediaFile(
    { name: 'huge.webp', type: 'image/webp', size: MAX_UPLOAD_BYTES + 1 },
    'PROPERTY_PHOTO',
  );
  assert.equal(oversize.valid, false);
  assert.match(oversize.reason, /5 MB/);

  // PDF rejected for property photo, accepted for verification document
  const pdfPhoto = validateMediaFile(
    { name: 'id.pdf', type: 'application/pdf', size: 120_000 },
    'PROPERTY_PHOTO',
  );
  assert.equal(pdfPhoto.valid, false);

  assert.deepEqual(
    validateMediaFile({ name: 'ghana-card.pdf', type: 'application/pdf', size: 120_000 }, 'VERIFICATION_DOCUMENT'),
    { valid: true },
  );

  // SVG and path traversal rejected
  assert.equal(
    validateMediaFile({ name: 'xss.svg', type: 'image/svg+xml', size: 512 }, 'VERIFICATION_DOCUMENT').valid,
    false,
  );
  assert.equal(
    validateMediaFile({ name: '../other/photo.webp', type: 'image/webp', size: 512 }, 'PROPERTY_PHOTO').valid,
    false,
  );
});

test('isSignedUrlExpired accurately flags expired temporary links', () => {
  const now = Date.parse('2026-11-28T15:00:00Z');
  assert.equal(isSignedUrlExpired('2026-11-28T15:05:00Z', now), false);
  assert.equal(isSignedUrlExpired('2026-11-28T15:00:00Z', now), true);
  assert.equal(isSignedUrlExpired('2026-11-28T14:59:59Z', now), true);
  assert.equal(isSignedUrlExpired('not-a-date', now), true);
});

test('reorderPhotos and setCoverPhoto update positions and cover cleanly', () => {
  const photos = [
    { assetId: 'a', documentId: 'd1', publicUrl: '/a', storageKey: 'k1', sizeBytes: 1000, isCover: true, position: 0 },
    { assetId: 'b', documentId: 'd2', publicUrl: '/b', storageKey: 'k2', sizeBytes: 2000, isCover: false, position: 1 },
    { assetId: 'c', documentId: 'd3', publicUrl: '/c', storageKey: 'k3', sizeBytes: 3000, isCover: false, position: 2 },
  ];

  const reordered = reorderPhotos(photos, 2, 0);
  assert.deepEqual(reordered.map((p) => p.assetId), ['c', 'a', 'b']);
  assert.deepEqual(reordered.map((p) => p.position), [0, 1, 2]);

  const withCover = setCoverPhoto(reordered, 'b');
  assert.deepEqual(withCover.map((p) => p.isCover), [false, false, true]);
  assert.equal(formatBytes(2048), '2 KB');
  assert.equal(formatBytes(5 * 1024 * 1024), '5.0 MB');
});
