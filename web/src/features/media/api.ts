import { apiFetch } from '../../lib/api';
import type {
  MediaAssetSummary,
  MediaOwnerType,
  PresignedUploadResponse,
  SignedDownloadResponse,
} from './types';

export function requestPresignedUpload(
  accessToken: string,
  input: {
    ownerType: MediaOwnerType;
    ownerId: string;
    filename: string;
    contentType: string;
    sizeBytes: number;
  },
): Promise<PresignedUploadResponse> {
  return apiFetch<PresignedUploadResponse>('/owner/media/presign', {
    method: 'POST',
    accessToken,
    body: JSON.stringify(input),
  });
}

/**
 * Uploads file bytes directly to Cloudflare R2 using the pre-signed PUT URL without proxying
 * through the Spring Boot API (`S1-09`, `TA-12`). Reports real upload progress (0–100).
 */
export function uploadDirectlyToStorage(
  uploadUrl: string,
  file: Blob,
  requiredHeaders: Record<string, string>,
  onProgress?: (percent: number) => void,
): Promise<void> {
  // In local stub environments (no live R2 configured), skip the network PUT cleanly.
  if (uploadUrl.startsWith('https://r2-stub.findstay.local/')) {
    onProgress?.(100);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', uploadUrl, true);
    for (const [header, value] of Object.entries(requiredHeaders)) {
      xhr.setRequestHeader(header, value);
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && event.total > 0) {
        onProgress?.(Math.min(100, Math.round((event.loaded / event.total) * 100)));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(100);
        resolve();
      } else {
        reject(new Error(`Direct storage upload failed (HTTP ${xhr.status}).`));
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error while uploading directly to storage. Please retry.'));
    };

    xhr.send(file);
  });
}

export function confirmMediaUpload(
  accessToken: string,
  assetId: string,
): Promise<MediaAssetSummary> {
  return apiFetch<MediaAssetSummary>(`/owner/media/${encodeURIComponent(assetId)}/confirm`, {
    method: 'POST',
    accessToken,
  });
}

export function promotePhotoToPublicWebp(
  accessToken: string,
  assetId: string,
): Promise<MediaAssetSummary> {
  return apiFetch<MediaAssetSummary>(`/owner/media/${encodeURIComponent(assetId)}/promote-webp`, {
    method: 'POST',
    accessToken,
  });
}

export function listOwnerMedia(
  accessToken: string,
  ownerType: MediaOwnerType,
  ownerId: string,
): Promise<MediaAssetSummary[]> {
  const params = new URLSearchParams({ ownerType, ownerId });
  return apiFetch<MediaAssetSummary[]>(`/owner/media?${params.toString()}`, {
    accessToken,
  });
}

export function deleteOwnerMedia(accessToken: string, assetId: string): Promise<void> {
  return apiFetch<void>(`/owner/media/${encodeURIComponent(assetId)}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function fetchPrivateSignedUrl(
  accessToken: string,
  assetId: string,
): Promise<SignedDownloadResponse> {
  return apiFetch<SignedDownloadResponse>(`/media/${encodeURIComponent(assetId)}/signed-url`, {
    accessToken,
  });
}
