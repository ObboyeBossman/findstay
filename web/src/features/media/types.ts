export type MediaBucket = 'PUBLIC_IMAGES' | 'PRIVATE_DOCS';

export type MediaOwnerType = 'PROPERTY_PHOTO' | 'VERIFICATION_DOCUMENT' | 'AVATAR';

export type MediaAssetStatus = 'PENDING_UPLOAD' | 'READY' | 'DELETED';

export type PresignedUploadResponse = {
  assetId: string;
  documentId: string;
  bucket: MediaBucket;
  storageKey: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
  publicUrl: string | null;
};

export type MediaAssetSummary = {
  assetId: string;
  documentId: string | null;
  organizationId: string;
  ownerType: MediaOwnerType | null;
  ownerId: string | null;
  bucket: MediaBucket;
  storageKey: string;
  contentType: string;
  sizeBytes: number;
  status: MediaAssetStatus;
  publicUrl: string | null;
  createdAt: string;
  uploadedAt: string | null;
};

export type SignedDownloadResponse = {
  assetId: string;
  storageKey: string;
  downloadUrl: string;
  expiresAt: string;
  contentType: string;
  sizeBytes: number;
};

export type ManagedPhotoItem = {
  assetId: string;
  documentId: string | null;
  publicUrl: string;
  storageKey: string;
  sizeBytes: number;
  isCover: boolean;
  position: number;
};
