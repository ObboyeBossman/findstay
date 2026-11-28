import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Upload,
  XCircle,
} from 'lucide-react';
import { InlineError, SkeletonCard, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import {
  confirmMediaUpload,
  formatBytes,
  uploadDirectlyToStorage,
  validateMediaFile,
} from '../media';
import {
  fetchOwnerVerificationStatus,
  fetchVerificationDocumentSignedUrl,
  presignVerificationDocument,
  resubmitOwnerVerification,
  submitOwnerVerification,
} from './api';
import type {
  OwnerVerificationStatusResponse,
  SubmittedDocumentInput,
  VerificationCaseStatus,
  VerificationDocumentType,
  VerificationDocumentView,
} from './types';
import {
  getDocumentDescription,
  getDocumentLabel,
  getMissingResubmissionTypes,
  isValidGhanaCardNumber,
  normalizeGhanaCardNumber,
  REQUIRED_VERIFICATION_DOCS,
} from './validation';

type UploadedDocDraft = {
  documentType: VerificationDocumentType;
  documentId: string;
  assetId: string;
  filename: string;
  sizeBytes: number;
};

function formatAccraTimestamp(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('en-GH', {
      timeZone: 'Africa/Accra',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function statusBadgeStyle(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-status-success/15 text-status-success';
    case 'PENDING':
      return 'bg-olive/15 text-olive';
    case 'PARTIALLY_REJECTED':
      return 'bg-status-warning/15 text-status-warning';
    case 'REJECTED':
      return 'bg-status-error/15 text-status-error';
    default:
      return 'bg-surface-muted text-earth';
  }
}

function statusDisplayLabel(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'Verified Owner';
    case 'PENDING':
      return 'Under Review';
    case 'PARTIALLY_REJECTED':
      return 'Corrections Requested';
    case 'REJECTED':
      return 'Verification Rejected';
    default:
      return 'Not Submitted';
  }
}

/**
 * Owner Verification Wizard & Status Tracker (`S1-12-T5`, `SCR-09`, `SCR-10`).
 * Supports initial 3-document submission, AES-256 encrypted Ghana Card number entry, masked
 * status tracking, reviewer fix notes, expiring signed-URL previews, and single-doc resubmission.
 */
export const OwnerVerificationPage: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const cardInputId = useId();
  const cardErrorId = useId();
  const formErrorId = useId();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState<OwnerVerificationStatusResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [ghanaCardNumber, setGhanaCardNumber] = useState('');
  const [cardError, setCardError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [drafts, setDrafts] = useState<Partial<Record<VerificationDocumentType, UploadedDocDraft>>>({});
  const [uploadingType, setUploadingType] = useState<VerificationDocumentType | null>(null);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [docErrors, setDocErrors] = useState<Partial<Record<VerificationDocumentType, string>>>({});
  const [previewingAssetId, setPreviewingAssetId] = useState<string | null>(null);

  const fileInputRefs = useRef<Partial<Record<VerificationDocumentType, HTMLInputElement | null>>>({});

  const token = session?.access_token ?? '';

  const loadStatus = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const data = await fetchOwnerVerificationStatus(token);
      setStatusData(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load verification status.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const currentCase = statusData?.verificationCase ?? null;
  const caseStatus: VerificationCaseStatus | 'NOT_SUBMITTED' =
    currentCase?.status ?? 'NOT_SUBMITTED';
  const isResubmitMode =
    caseStatus === 'PARTIALLY_REJECTED' || caseStatus === 'REJECTED';
  const isEditable = caseStatus === 'NOT_SUBMITTED' || isResubmitMode;

  const existingDocMap: Partial<Record<VerificationDocumentType, VerificationDocumentView>> = {};
  if (currentCase) {
    for (const doc of currentCase.documents) {
      existingDocMap[doc.documentType] = doc;
    }
  }

  const handleUploadFile = async (docType: VerificationDocumentType, file: File | undefined) => {
    if (!file || !token) return;
    setDocErrors((prev) => ({ ...prev, [docType]: undefined }));
    setFormError(null);

    const check = validateMediaFile(file, 'VERIFICATION_DOCUMENT');
    if (!check.valid) {
      setDocErrors((prev) => ({ ...prev, [docType]: check.reason }));
      return;
    }

    setUploadingType(docType);
    setUploadPercent(20);
    try {
      const presign = await presignVerificationDocument(token, {
        documentType: docType,
        filename: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      setUploadPercent(45);
      await uploadDirectlyToStorage(
        presign.upload.uploadUrl,
        file,
        presign.upload.requiredHeaders,
        (pct) => setUploadPercent(Math.min(90, 45 + Math.round(pct * 0.45))),
      );

      await confirmMediaUpload(token, presign.upload.assetId);
      setUploadPercent(100);

      setDrafts((prev) => ({
        ...prev,
        [docType]: {
          documentType: docType,
          documentId: presign.documentId,
          assetId: presign.upload.assetId,
          filename: file.name,
          sizeBytes: file.size,
        },
      }));

      showToast({
        variant: 'success',
        title: `${getDocumentLabel(docType)} uploaded`,
        message: 'Stored privately. Submit your verification when all required files are ready.',
      });
    } catch (err) {
      setDocErrors((prev) => ({
        ...prev,
        [docType]: err instanceof Error ? err.message : 'Document upload failed. Please retry.',
      }));
    } finally {
      setUploadingType(null);
      setUploadPercent(0);
      const input = fileInputRefs.current[docType];
      if (input) input.value = '';
    }
  };

  const handlePreviewAsset = async (assetId: string) => {
    if (!token) return;
    setPreviewingAssetId(assetId);
    setFormError(null);
    try {
      const signed = await fetchVerificationDocumentSignedUrl(token, assetId);
      window.open(signed.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to open secure preview link.');
    } finally {
      setPreviewingAssetId(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setCardError(null);
    setFormError(null);

    if (!isResubmitMode) {
      const normalized = normalizeGhanaCardNumber(ghanaCardNumber);
      if (!isValidGhanaCardNumber(normalized)) {
        setCardError('Enter a valid Ghana Card number in format GHA-XXXXXXXXX-X.');
        return;
      }

      const missingTypes = REQUIRED_VERIFICATION_DOCS.filter((type) => !drafts[type]);
      if (missingTypes.length > 0) {
        setFormError(
          `Please upload all 3 required documents before submitting: ${missingTypes
            .map(getDocumentLabel)
            .join(', ')}.`,
        );
        return;
      }

      const documents: SubmittedDocumentInput[] = REQUIRED_VERIFICATION_DOCS.map((type) => {
        const draft = drafts[type]!;
        return {
          documentType: type,
          documentId: draft.documentId,
          assetId: draft.assetId,
        };
      });

      setSubmitting(true);
      try {
        await submitOwnerVerification(token, {
          ghanaCardNumber: normalized,
          documents,
        });
        setGhanaCardNumber('');
        setDrafts({});
        showToast({
          variant: 'success',
          title: 'Verification submitted',
          message: 'Our review team will inspect your documents shortly.',
        });
        await loadStatus();
      } catch (err) {
        setFormError(err instanceof Error ? err.message : 'Unable to submit verification.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Resubmission mode
    const trimmedCard = ghanaCardNumber.trim();
    if (trimmedCard && !isValidGhanaCardNumber(trimmedCard)) {
      setCardError('Enter a valid Ghana Card number in format GHA-XXXXXXXXX-X, or leave blank to keep the existing card.');
      return;
    }

    const missingRejected = getMissingResubmissionTypes(currentCase?.documents ?? [], drafts);
    if (missingRejected.length > 0) {
      setFormError(
        `Please upload a replacement for each rejected document: ${missingRejected
          .map(getDocumentLabel)
          .join(', ')}.`,
      );
      return;
    }

    const updatedDocs: SubmittedDocumentInput[] = Object.values(drafts)
      .filter((d): d is UploadedDocDraft => Boolean(d))
      .map((d) => ({
        documentType: d.documentType,
        documentId: d.documentId,
        assetId: d.assetId,
      }));

    if (updatedDocs.length === 0) {
      setFormError('Upload at least one updated document before resubmitting.');
      return;
    }

    setSubmitting(true);
    try {
      await resubmitOwnerVerification(token, {
        ghanaCardNumber: trimmedCard ? normalizeGhanaCardNumber(trimmedCard) : undefined,
        documents: updatedDocs,
      });
      setGhanaCardNumber('');
      setDrafts({});
      showToast({
        variant: 'success',
        title: 'Verification resubmitted',
        message: 'Your updated documents are back in the review queue.',
      });
      await loadStatus();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to resubmit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-caption font-semibold uppercase tracking-wider text-olive">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Owner Identity &amp; Property Verification
          </div>
          <h1 className="font-display text-heading-2 font-bold text-earth">
            Verification Centre
          </h1>
          <p className="max-w-2xl text-body-2 text-earth/80">
            Verify your identity and property management credentials once to publish listings across
            Takoradi and Ghana. Your Ghana Card number is AES-256 encrypted at rest under Ghana Data
            Protection Act 843.
          </p>
        </div>

        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-label font-semibold ${statusBadgeStyle(
            caseStatus,
          )}`}
        >
          {caseStatus === 'APPROVED' ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
          ) : caseStatus === 'PENDING' ? (
            <Clock className="h-4 w-4" aria-hidden="true" />
          ) : caseStatus === 'REJECTED' ? (
            <XCircle className="h-4 w-4" aria-hidden="true" />
          ) : caseStatus === 'PARTIALLY_REJECTED' ? (
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Lock className="h-4 w-4" aria-hidden="true" />
          )}
          {statusDisplayLabel(caseStatus)}
        </span>
      </header>

      {loadError ? <InlineError id="verification-load-error" message={loadError} /> : null}

      {currentCase ? (
        <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm">
          <h2 className="text-heading-4 font-semibold text-earth">Status Tracker</h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-muted/50 p-3">
              <dt className="text-caption text-earth/70">Ghana Card (Masked)</dt>
              <dd className="mt-1 font-mono text-body-1 font-semibold text-earth">
                {currentCase.maskedGhanaCardNumber}
              </dd>
            </div>
            <div className="rounded-xl bg-surface-muted/50 p-3">
              <dt className="text-caption text-earth/70">Submitted (Accra)</dt>
              <dd className="mt-1 text-body-2 font-medium text-earth">
                {formatAccraTimestamp(currentCase.submittedAt)}
              </dd>
            </div>
            <div className="rounded-xl bg-surface-muted/50 p-3">
              <dt className="text-caption text-earth/70">Last Decision (Accra)</dt>
              <dd className="mt-1 text-body-2 font-medium text-earth">
                {formatAccraTimestamp(currentCase.decidedAt)}
              </dd>
            </div>
          </dl>

          {currentCase.decisions.length > 0 ? (
            <div className="mt-4 rounded-xl border border-border-subtle bg-surface-muted/40 p-4">
              <h3 className="text-label font-semibold text-earth">Latest Reviewer Notes</h3>
              {currentCase.decisions[0].reason ? (
                <p className="mt-1 text-body-2 text-earth">{currentCase.decisions[0].reason}</p>
              ) : null}
              {currentCase.decisions[0].corrections.length > 0 ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-body-2 text-earth">
                  {currentCase.decisions[0].corrections.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-6">
        {isEditable ? (
          <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm">
            <h2 className="text-heading-4 font-semibold text-earth">
              Step 1 — Ghana Card Number
            </h2>
            <p className="mt-1 text-caption text-earth/75">
              {isResubmitMode
                ? 'Leave blank to keep your encrypted Ghana Card number on file, or enter a corrected number.'
                : 'Required format: GHA-XXXXXXXXX-X (encrypted immediately with AES-256-GCM; never returned in plaintext).'}
            </p>
            <div className="mt-4 max-w-md">
              <label
                htmlFor={cardInputId}
                className="block text-label font-semibold text-earth"
              >
                Ghana Card Number {!isResubmitMode ? '*' : '(optional update)'}
              </label>
              <input
                id={cardInputId}
                type="text"
                value={ghanaCardNumber}
                onChange={(e) => {
                  setGhanaCardNumber(e.target.value);
                  setCardError(null);
                }}
                placeholder="GHA-123456789-5"
                autoComplete="off"
                aria-invalid={Boolean(cardError)}
                aria-describedby={cardError ? cardErrorId : undefined}
                className="mt-1 w-full rounded-xl border border-border-default bg-surface-card px-4 py-3 font-mono text-body-1 text-earth focus-visible:outline-offset-2"
              />
              {cardError ? (
                <div className="mt-2">
                  <InlineError id={cardErrorId} message={cardError} />
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-4">
          <h2 className="text-heading-4 font-semibold text-earth">
            {isEditable ? 'Step 2 — Required Verification Documents' : 'Submitted Verification Documents'}
          </h2>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {REQUIRED_VERIFICATION_DOCS.map((docType) => {
              const existing = existingDocMap[docType];
              const draft = drafts[docType];
              const isUploading = uploadingType === docType;
              const docErr = docErrors[docType];
              const docLockedApproved = existing?.status === 'APPROVED';
              const activeAssetId = draft?.assetId ?? existing?.mediaAssetId ?? null;

              return (
                <div
                  key={docType}
                  className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-heading-5 font-semibold text-earth">
                        {getDocumentLabel(docType)}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-nano font-bold uppercase tracking-wider ${
                          draft
                            ? 'bg-olive/15 text-olive'
                            : existing
                              ? statusBadgeStyle(existing.status)
                              : 'bg-surface-muted text-earth'
                        }`}
                      >
                        {draft ? 'Ready' : existing ? existing.status : 'Required'}
                      </span>
                    </div>

                    <p className="text-caption text-earth/75">
                      {getDocumentDescription(docType)}
                    </p>

                    {existing?.fixNote ? (
                      <div className="rounded-xl border border-status-warning/40 bg-status-warning/10 p-3 text-caption text-earth">
                        <span className="font-semibold">Fix requested: </span>
                        {existing.fixNote}
                      </div>
                    ) : null}

                    {draft ? (
                      <div className="flex items-center gap-2 rounded-xl bg-surface-muted/50 p-2.5 text-caption text-earth">
                        <FileCheck2 className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
                        <span className="truncate">
                          {draft.filename} ({formatBytes(draft.sizeBytes)})
                        </span>
                      </div>
                    ) : null}

                    {isUploading ? (
                      <div className="rounded-xl bg-surface-muted/40 p-3">
                        <p className="text-caption font-medium text-earth">
                          Uploading privately… {uploadPercent}%
                        </p>
                        <progress
                          value={uploadPercent}
                          max={100}
                          className="mt-2 h-2 w-full overflow-hidden rounded-full accent-olive"
                        />
                      </div>
                    ) : null}

                    {docErr ? (
                      <InlineError id={`ver-doc-err-${docType}`} message={docErr} />
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[docType] = el;
                      }}
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/webp"
                      disabled={!isEditable || docLockedApproved || isUploading}
                      onChange={(e) => void handleUploadFile(docType, e.target.files?.[0])}
                      className="sr-only"
                    />

                    {isEditable && !docLockedApproved ? (
                      <button
                        type="button"
                        disabled={isUploading}
                        onClick={() => fileInputRefs.current[docType]?.click()}
                        className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-default bg-surface-card px-3 py-2 text-caption font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
                      >
                        {draft || existing ? (
                          <>
                            <RefreshCw className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Replace file
                          </>
                        ) : (
                          <>
                            <Upload className="mr-1.5 h-4 w-4" aria-hidden="true" />
                            Upload (max 5 MB)
                          </>
                        )}
                      </button>
                    ) : null}

                    {activeAssetId ? (
                      <button
                        type="button"
                        disabled={previewingAssetId === activeAssetId}
                        onClick={() => void handlePreviewAsset(activeAssetId)}
                        className="inline-flex min-h-touch items-center justify-center rounded-xl px-3 py-2 text-caption font-semibold text-olive transition-colors hover:bg-surface-hover disabled:opacity-50"
                      >
                        <ExternalLink className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        {previewingAssetId === activeAssetId ? 'Signing…' : 'Preview (5 min)'}
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {formError ? <InlineError id={formErrorId} message={formError} /> : null}

        {isEditable ? (
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="submit"
              disabled={submitting || Boolean(uploadingType)}
              className="inline-flex min-h-touch items-center justify-center rounded-xl bg-olive px-6 py-3 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive/90 disabled:opacity-50"
            >
              {submitting
                ? 'Submitting…'
                : isResubmitMode
                  ? 'Resubmit for Verification'
                  : 'Submit for Verification'}
            </button>
          </div>
        ) : null}
      </form>
    </section>
  );
};
