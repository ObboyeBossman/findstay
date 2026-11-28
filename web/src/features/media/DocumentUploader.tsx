import React, { useId, useRef, useState } from 'react';
import { ExternalLink, FileText, Lock, RefreshCw, Upload } from 'lucide-react';
import { InlineError, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import {
  confirmMediaUpload,
  fetchPrivateSignedUrl,
  requestPresignedUpload,
  uploadDirectlyToStorage,
} from './api';
import type { MediaAssetSummary } from './types';
import { formatBytes, validateMediaFile } from './validation';

interface DocumentUploaderProps {
  ownerId: string;
  label: string;
  description: string;
  uploadedAsset: MediaAssetSummary | null;
  onUploaded: (asset: MediaAssetSummary) => void;
  disabled?: boolean;
}

/**
 * Private Verification Document Uploader (`S1-09-T6`, `SCR-09`):
 * - Accepts PDF, JPEG, PNG, or WebP up to 5 MB
 * - Uploads directly to the private Cloudflare R2 bucket via pre-signed PUT
 * - Previews exclusively through 5-minute expiring signed GET URLs
 */
export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  ownerId,
  label,
  description,
  uploadedAsset,
  onUploaded,
  disabled = false,
}) => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const inputId = useId();
  const errorId = useId();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [uploadingName, setUploadingName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelected = async (file: File | undefined) => {
    if (!file || disabled) return;
    setError(null);

    const check = validateMediaFile(file, 'VERIFICATION_DOCUMENT');
    if (!check.valid) {
      setError(check.reason);
      return;
    }

    const token = session?.access_token;
    if (!token) {
      setError('Please sign in again before uploading verification documents.');
      return;
    }

    setUploadingName(file.name);
    setProgress(20);

    try {
      const presign = await requestPresignedUpload(token, {
        ownerType: 'VERIFICATION_DOCUMENT',
        ownerId,
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      setProgress(40);
      await uploadDirectlyToStorage(
        presign.uploadUrl,
        file,
        presign.requiredHeaders,
        (pct) => setProgress(Math.min(90, 40 + Math.round(pct * 0.5))),
      );

      const confirmed = await confirmMediaUpload(token, presign.assetId);
      setProgress(100);
      onUploaded(confirmed);
      showToast({
        variant: 'success',
        title: `${label} uploaded`,
        message: 'Stored privately with expiring access links.',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Document upload failed. Please retry.');
    } finally {
      setUploadingName(null);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleOpenSecurePreview = async () => {
    if (!uploadedAsset) return;
    const token = session?.access_token;
    if (!token) {
      setError('Please sign in to open a secure document preview.');
      return;
    }

    setLoadingPreview(true);
    setError(null);
    try {
      const signed = await fetchPrivateSignedUrl(token, uploadedAsset.assetId);
      window.open(signed.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to generate temporary document link.');
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-heading-5 font-semibold text-earth">{label}</h3>
          <p className="mt-1 text-caption text-earth/75">{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-nano font-semibold uppercase tracking-wider text-earth">
          <Lock className="h-3 w-3 text-olive" aria-hidden="true" />
          Private
        </span>
      </div>

      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="application/pdf,image/jpeg,image/png,image/webp"
        disabled={disabled || Boolean(uploadingName)}
        onChange={(e) => void handleFileSelected(e.target.files?.[0])}
        className="sr-only"
        aria-describedby={error ? errorId : undefined}
      />

      {uploadingName ? (
        <div className="mt-4 rounded-xl border border-border-subtle bg-surface-muted/40 p-3">
          <div className="flex items-center justify-between gap-2 text-caption">
            <span className="truncate font-semibold text-earth">{uploadingName}</span>
            <span className="shrink-0 text-earth/75">Uploading… {progress}%</span>
          </div>
          <progress
            value={progress}
            max={100}
            className="mt-2 h-2 w-full overflow-hidden rounded-full accent-olive"
          />
        </div>
      ) : uploadedAsset ? (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-muted/40 p-3">
          <div className="flex min-w-0 items-center gap-2">
            <FileText className="h-5 w-5 shrink-0 text-olive" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-body-2 font-medium text-earth">
                {uploadedAsset.contentType} · {formatBytes(uploadedAsset.sizeBytes)}
              </p>
              <p className="text-caption text-earth/70">Status: {uploadedAsset.status}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={loadingPreview}
              onClick={() => void handleOpenSecurePreview()}
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-default bg-surface-card px-3 py-2 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" />
              {loadingPreview ? 'Signing link…' : 'Preview (5 min)'}
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-touch items-center justify-center rounded-xl px-3 py-2 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
            >
              <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
              Replace
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <button
            type="button"
            disabled={disabled}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-default bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
          >
            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
            Upload document (PDF, JPG, PNG, WebP · max 5 MB)
          </button>
        </div>
      )}

      {error ? (
        <div className="mt-3">
          <InlineError id={errorId} message={error} />
        </div>
      ) : null}
    </div>
  );
};
