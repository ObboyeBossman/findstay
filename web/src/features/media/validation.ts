import type { ManagedPhotoItem, MediaOwnerType } from './types';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5 MB (NFR-17)
export const MAX_PROPERTY_PHOTOS = 10;
export const TARGET_3G_WEBP_MAX_BYTES = 400 * 1024; // 400 KB target for mobile 3G

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/webp',
  'image/jpeg',
  'image/png',
] as const;

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export type FileMetadataLike = {
  name: string;
  type: string;
  size: number;
};

export type FileValidationResult =
  | { valid: true }
  | { valid: false; reason: string };

/**
 * Early client-side check matching the API and PostgreSQL rules (`S1-09-T6`, `NFR-17`):
 * rejects empty files, files larger than 5 MB, path-traversal names, and disallowed MIME types.
 */
export function validateMediaFile(
  file: FileMetadataLike,
  ownerType: MediaOwnerType,
): FileValidationResult {
  if (!file || !file.name.trim()) {
    return { valid: false, reason: 'Please select a valid file.' };
  }
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { valid: false, reason: 'File name must not contain path separators.' };
  }
  if (file.size <= 0) {
    return { valid: false, reason: 'This file is empty. Please choose another file.' };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      valid: false,
      reason: `"${file.name}" is ${formatBytes(file.size)}, which exceeds the 5 MB upload limit.`,
    };
  }

  const normalizedType = file.type.trim().toLowerCase();
  const allowed: readonly string[] =
    ownerType === 'VERIFICATION_DOCUMENT'
      ? ALLOWED_DOCUMENT_MIME_TYPES
      : ALLOWED_IMAGE_MIME_TYPES;

  if (!allowed.includes(normalizedType)) {
    const hint =
      ownerType === 'VERIFICATION_DOCUMENT'
        ? 'PDF, JPEG, PNG, or WebP'
        : 'WebP, JPEG, or PNG';
    return {
      valid: false,
      reason: `Unsupported file type for "${file.name}". Please upload ${hint}.`,
    };
  }

  return { valid: true };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

export function isSignedUrlExpired(expiresAtIso: string, nowMs: number = Date.now()): boolean {
  const parsed = Date.parse(expiresAtIso);
  if (Number.isNaN(parsed)) return true;
  return nowMs >= parsed;
}

export function reorderPhotos(
  items: readonly ManagedPhotoItem[],
  fromIndex: number,
  toIndex: number,
): ManagedPhotoItem[] {
  if (
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= items.length ||
    toIndex >= items.length ||
    fromIndex === toIndex
  ) {
    return [...items];
  }
  const next = [...items];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((item, idx) => ({ ...item, position: idx }));
}

export function setCoverPhoto(
  items: readonly ManagedPhotoItem[],
  assetId: string,
): ManagedPhotoItem[] {
  return items.map((item) => ({
    ...item,
    isCover: item.assetId === assetId,
  }));
}
