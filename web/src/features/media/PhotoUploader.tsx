import React, { useId, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Star, Trash2, UploadCloud } from 'lucide-react';
import { InlineError, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import {
  confirmMediaUpload,
  deleteOwnerMedia,
  promotePhotoToPublicWebp,
  requestPresignedUpload,
  uploadDirectlyToStorage,
} from './api';
import type { ManagedPhotoItem } from './types';
import {
  formatBytes,
  MAX_PROPERTY_PHOTOS,
  reorderPhotos,
  setCoverPhoto,
  validateMediaFile,
} from './validation';
import { convertImageToWebp } from './webp';

interface PhotoUploaderProps {
  ownerId: string;
  photos: ManagedPhotoItem[];
  onChange: (nextPhotos: ManagedPhotoItem[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

type ActiveUpload = {
  id: string;
  filename: string;
  stage: string;
  percent: number;
};

/**
 * Property Photo Uploader (`S1-09-T6`, `SCR-12`):
 * - Early 5 MB and MIME validation before upload
 * - Client-side WebP compression for 3G-friendly payloads
 * - Direct-to-R2 pre-signed PUT with progress bar
 * - Cover photo selector, keyboard-friendly reordering, and soft-delete
 */
export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  ownerId,
  photos,
  onChange,
  maxPhotos = MAX_PROPERTY_PHOTOS,
  disabled = false,
}) => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const inputId = useId();
  const errorId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploads, setUploads] = useState<ActiveUpload[]>([]);

  const remainingSlots = Math.max(0, maxPhotos - photos.length);
  const isAtLimit = remainingSlots === 0;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || disabled) return;
    setError(null);

    const token = session?.access_token;
    if (!token) {
      setError('Please sign in again before uploading photos.');
      return;
    }

    const selected = Array.from(fileList);
    if (selected.length > remainingSlots) {
      setError(
        `You can upload at most ${maxPhotos} photos per property (${remainingSlots} slot${remainingSlots === 1 ? '' : 's'} remaining).`,
      );
      return;
    }

    let currentPhotos = [...photos];

    for (const rawFile of selected) {
      const check = validateMediaFile(rawFile, 'PROPERTY_PHOTO');
      if (!check.valid) {
        setError(check.reason);
        continue;
      }

      const uploadKey = `${rawFile.name}-${Date.now()}-${Math.random()}`;
      setUploads((prev) => [
        ...prev,
        { id: uploadKey, filename: rawFile.name, stage: 'Optimising to WebP…', percent: 15 },
      ]);

      try {
        const webpFile = await convertImageToWebp(rawFile);
        const postCheck = validateMediaFile(webpFile, 'PROPERTY_PHOTO');
        if (!postCheck.valid) {
          throw new Error(postCheck.reason);
        }

        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadKey
              ? { ...u, filename: webpFile.name, stage: 'Requesting secure upload slot…', percent: 30 }
              : u,
          ),
        );

        const presign = await requestPresignedUpload(token, {
          ownerType: 'PROPERTY_PHOTO',
          ownerId,
          filename: webpFile.name,
          contentType: webpFile.type,
          sizeBytes: webpFile.size,
        });

        setUploads((prev) =>
          prev.map((u) =>
            u.id === uploadKey ? { ...u, stage: 'Uploading directly to storage…', percent: 45 } : u,
          ),
        );

        await uploadDirectlyToStorage(
          presign.uploadUrl,
          webpFile,
          presign.requiredHeaders,
          (pct) => {
            const mapped = Math.min(90, 45 + Math.round(pct * 0.45));
            setUploads((prev) =>
              prev.map((u) => (u.id === uploadKey ? { ...u, percent: mapped } : u)),
            );
          },
        );

        const confirmed = await confirmMediaUpload(token, presign.assetId);
        const promoted =
          confirmed.contentType === 'image/webp'
            ? await promotePhotoToPublicWebp(token, confirmed.assetId)
            : confirmed;

        const nextItem: ManagedPhotoItem = {
          assetId: promoted.assetId,
          documentId: promoted.documentId,
          publicUrl: promoted.publicUrl ?? presign.publicUrl ?? '',
          storageKey: promoted.storageKey,
          sizeBytes: promoted.sizeBytes,
          isCover: currentPhotos.length === 0,
          position: currentPhotos.length,
        };

        currentPhotos = [...currentPhotos, nextItem];
        onChange(currentPhotos);

        showToast({
          variant: 'success',
          title: 'Photo uploaded',
          message: `${webpFile.name} (${formatBytes(webpFile.size)}) is ready.`,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Photo upload failed. Please retry.');
      } finally {
        setUploads((prev) => prev.filter((u) => u.id !== uploadKey));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSetCover = (assetId: string) => {
    onChange(setCoverPhoto(photos, assetId));
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    onChange(reorderPhotos(photos, fromIndex, toIndex));
  };

  const handleRemove = async (assetId: string) => {
    const token = session?.access_token;
    if (token) {
      try {
        await deleteOwnerMedia(token, assetId);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to remove photo.');
        return;
      }
    }
    const filtered = photos
      .filter((p) => p.assetId !== assetId)
      .map((p, idx) => ({ ...p, position: idx }));
    if (filtered.length > 0 && !filtered.some((p) => p.isCover)) {
      filtered[0] = { ...filtered[0], isCover: true };
    }
    onChange(filtered);
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isAtLimit) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? 'border-olive bg-olive/10'
            : 'border-border-default bg-surface-muted/40'
        } ${disabled || isAtLimit ? 'opacity-60' : ''}`}
      >
        <UploadCloud className="mb-2 h-8 w-8 text-olive" aria-hidden="true" />
        <p className="text-body-2 font-semibold text-earth">
          {isAtLimit
            ? `Maximum of ${maxPhotos} photos reached`
            : 'Drag & drop property photos or tap to browse'}
        </p>
        <p className="mt-1 text-caption text-earth/75">
          Up to {maxPhotos} photos · Max 5 MB each · Optimised to WebP automatically for fast 3G loading
        </p>

        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept="image/webp,image/jpeg,image/png"
          multiple
          disabled={disabled || isAtLimit}
          onChange={(e) => void handleFiles(e.target.files)}
          className="sr-only"
          aria-describedby={error ? errorId : undefined}
        />

        <div className="mt-4">
          <button
            type="button"
            disabled={disabled || isAtLimit}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-default bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
            Choose photos ({photos.length}/{maxPhotos})
          </button>
        </div>
      </div>

      {error ? <InlineError id={errorId} message={error} /> : null}

      {uploads.length > 0 ? (
        <ul className="space-y-2" aria-label="Active photo uploads">
          {uploads.map((item) => (
            <li
              key={item.id}
              className="rounded-xl border border-border-subtle bg-surface-card p-3"
            >
              <div className="flex items-center justify-between gap-2 text-caption">
                <span className="truncate font-semibold text-earth">{item.filename}</span>
                <span className="shrink-0 text-earth/75">
                  {item.stage} ({item.percent}%)
                </span>
              </div>
              <progress
                value={item.percent}
                max={100}
                className="mt-2 h-2 w-full overflow-hidden rounded-full accent-olive"
              />
            </li>
          ))}
        </ul>
      ) : null}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <div
              key={photo.assetId}
              className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-sm"
            >
              <div className="relative aspect-video bg-surface-muted">
                {photo.publicUrl ? (
                  <img
                    src={photo.publicUrl}
                    alt={`Property photo ${index + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : null}
                {photo.isCover ? (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-olive px-2.5 py-0.5 text-nano font-bold uppercase tracking-wider text-on-brand">
                    <Star className="h-3 w-3" aria-hidden="true" />
                    Cover
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-1 p-2">
                <span className="text-caption text-earth/75">{formatBytes(photo.sizeBytes)}</span>
                <div className="flex items-center gap-1">
                  {!photo.isCover ? (
                    <button
                      type="button"
                      onClick={() => handleSetCover(photo.assetId)}
                      aria-label={`Set photo ${index + 1} as cover`}
                      className="rounded-lg border border-border-subtle px-2 py-1 text-caption font-medium text-earth hover:bg-surface-hover"
                    >
                      Cover
                    </button>
                  ) : null}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMove(index, index - 1)}
                    aria-label={`Move photo ${index + 1} earlier`}
                    className="rounded-lg border border-border-subtle p-1 text-earth hover:bg-surface-hover disabled:opacity-40"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    disabled={index === photos.length - 1}
                    onClick={() => handleMove(index, index + 1)}
                    aria-label={`Move photo ${index + 1} later`}
                    className="rounded-lg border border-border-subtle p-1 text-earth hover:bg-surface-hover disabled:opacity-40"
                  >
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemove(photo.assetId)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="rounded-lg border border-border-subtle p-1 text-status-error hover:bg-surface-hover"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
