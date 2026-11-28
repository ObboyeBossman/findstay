import React, { useCallback, useEffect, useId, useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileCheck2,
  MapPin,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { EmptyState, InlineError, SkeletonCard, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import { formatGhsPesewas } from '../listing';
import { fetchPrivateSignedUrl } from '../media';
import { getDocumentLabel, type VerificationDocumentType } from '../verification';
import {
  fetchAdminReviewDetail,
  fetchAdminReviewQueue,
  restoreAdminListing,
  submitAdminReviewDecision,
  suspendAdminListing,
} from './api';
import type {
  ReviewDecisionType,
  ReviewDetailResponse,
  ReviewEntityKind,
  ReviewQueueItem,
  ReviewQueueStatusTab,
} from './types';
import {
  getReviewStatusBadge,
  parseCorrectionLines,
  validateModerationReason,
  validateReviewDecision,
} from './validation';

const STATUS_TABS: Array<{ key: ReviewQueueStatusTab; label: string }> = [
  { key: 'PENDING', label: 'Pending Review' },
  { key: 'LIVE', label: 'Live & Suspended Listings' },
  { key: 'DECIDED', label: 'Decided History' },
  { key: 'ALL', label: 'All' },
];

const KIND_FILTERS: Array<{ key: 'ALL' | ReviewEntityKind; label: string }> = [
  { key: 'ALL', label: 'All Items' },
  { key: 'VERIFICATION', label: 'Owner Verifications' },
  { key: 'LISTING', label: 'Property Listings' },
];

function formatAccraTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return `${new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(dt)} GMT`;
}

/**
 * Unified Admin Approval Queue & Detailed Review Screen (`SCR-16`, `SCR-17`, `S1-15-T4`).
 * Supports inspecting owner verification cases (with expiring signed private-doc previews),
 * inspecting property listings (units, GHS prices, WebP photos), approving/requesting
 * corrections/rejecting with mandatory written reasons, and suspending/restoring live listings.
 */
export const AdminReviewsPage: React.FC = () => {
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();

  const reasonId = useId();
  const correctionsId = useId();
  const moderationReasonId = useId();
  const queueErrorId = useId();
  const actionErrorId = useId();

  const [statusTab, setStatusTab] = useState<ReviewQueueStatusTab>('PENDING');
  const [kindFilter, setKindFilter] = useState<'ALL' | ReviewEntityKind>('ALL');

  const [loadingQueue, setLoadingQueue] = useState(true);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [queue, setQueue] = useState<ReviewQueueItem[]>([]);

  const [selectedKey, setSelectedKey] = useState<{ kind: ReviewEntityKind; id: string } | null>(
    null,
  );
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detail, setDetail] = useState<ReviewDetailResponse | null>(null);

  const [decisionReason, setDecisionReason] = useState('');
  const [correctionLinesRaw, setCorrectionLinesRaw] = useState('');
  const [rejectedDocTypes, setRejectedDocTypes] = useState<VerificationDocumentType[]>([]);
  const [moderationReason, setModerationReason] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [openingAssetId, setOpeningAssetId] = useState<string | null>(null);

  const canDecide = hasPermission('admin.review.decide');
  const canModerate = hasPermission('admin.listing.moderate');

  const loadQueue = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setLoadingQueue(true);
    setQueueError(null);
    try {
      const items = await fetchAdminReviewQueue(token, {
        kind: kindFilter,
        status: statusTab,
      });
      setQueue(items);
      setSelectedKey((prev) => {
        if (prev && items.some((i) => i.id === prev.id && i.kind === prev.kind)) {
          return prev;
        }
        return items.length > 0 ? { kind: items[0].kind, id: items[0].id } : null;
      });
    } catch (err) {
      setQueueError(err instanceof Error ? err.message : 'Unable to load review queue.');
    } finally {
      setLoadingQueue(false);
    }
  }, [session?.access_token, kindFilter, statusTab]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const loadDetail = useCallback(async () => {
    const token = session?.access_token;
    if (!token || !selectedKey) {
      setDetail(null);
      return;
    }
    setLoadingDetail(true);
    setActionError(null);
    try {
      const loaded = await fetchAdminReviewDetail(token, selectedKey.kind, selectedKey.id);
      setDetail(loaded);
      setDecisionReason('');
      setCorrectionLinesRaw('');
      setRejectedDocTypes([]);
      setModerationReason('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to load submission details.');
    } finally {
      setLoadingDetail(false);
    }
  }, [session?.access_token, selectedKey]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const toggleRejectedDoc = (docType: VerificationDocumentType) => {
    setRejectedDocTypes((prev) =>
      prev.includes(docType) ? prev.filter((t) => t !== docType) : [...prev, docType],
    );
  };

  const handleOpenPrivateDoc = async (assetId: string) => {
    const token = session?.access_token;
    if (!token) return;
    setOpeningAssetId(assetId);
    try {
      const signed = await fetchPrivateSignedUrl(token, assetId);
      window.open(signed.downloadUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Unable to open document',
        message: err instanceof Error ? err.message : 'Could not issue expiring download URL.',
      });
    } finally {
      setOpeningAssetId(null);
    }
  };

  const handleDecision = async (decision: ReviewDecisionType) => {
    const token = session?.access_token;
    if (!token || !detail || !canDecide) return;

    const corrections = parseCorrectionLines(correctionLinesRaw);
    const validationError = validateReviewDecision(decision, decisionReason, corrections);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const updated = await submitAdminReviewDecision(token, detail.kind, detail.id, {
        decision,
        reason: decisionReason.trim(),
        corrections: corrections.length > 0 ? corrections : undefined,
        rejectedDocumentTypes:
          detail.kind === 'VERIFICATION' && decision === 'REQUEST_CORRECTIONS'
            ? rejectedDocTypes
            : undefined,
      });
      setDetail(updated);
      setDecisionReason('');
      setCorrectionLinesRaw('');
      setRejectedDocTypes([]);
      showToast({
        variant: 'success',
        title: 'Decision recorded',
        message: `Updated status to ${updated.status}. Owner notified and audit log updated.`,
      });
      await loadQueue();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to submit review decision.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleModeration = async (action: 'SUSPEND' | 'RESTORE') => {
    const token = session?.access_token;
    if (!token || !detail || detail.kind !== 'LISTING' || !canModerate) return;

    const validationError = validateModerationReason(moderationReason);
    if (validationError) {
      setActionError(validationError);
      return;
    }

    setSubmitting(true);
    setActionError(null);
    try {
      const updated =
        action === 'SUSPEND'
          ? await suspendAdminListing(token, detail.id, moderationReason.trim())
          : await restoreAdminListing(token, detail.id, moderationReason.trim());
      setDetail(updated);
      setModerationReason('');
      showToast({
        variant: 'success',
        title: action === 'SUSPEND' ? 'Listing suspended' : 'Listing restored',
        message:
          action === 'SUSPEND'
            ? 'Listing removed from public guest search, audited, and owner notified.'
            : 'Listing restored to public guest search, audited, and owner notified.',
      });
      await loadQueue();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Unable to moderate listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const isPendingItem =
    detail?.status === 'PENDING' || detail?.status === 'PENDING_REVIEW';
  const canSuspendListing =
    canModerate &&
    detail?.kind === 'LISTING' &&
    (detail.status === 'ACTIVE' || detail.status === 'PAUSED');
  const canRestoreListing =
    canModerate && detail?.kind === 'LISTING' && detail.status === 'SUSPENDED';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-heading-2 font-bold text-earth">
            Admin Approval Queue
          </h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Review owner verifications and submitted listings before publication. Every decision is audited and notifies the owner.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadQueue()}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover"
        >
          <RefreshCw className="h-4 w-4 text-olive" aria-hidden="true" />
          Refresh Queue
        </button>
      </div>

      {/* Status & Kind Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Review queue status">
          {STATUS_TABS.map((tab) => {
            const active = statusTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusTab(tab.key)}
                className={`min-h-touch rounded-full border px-4 py-1.5 text-caption font-semibold transition-colors ${
                  active
                    ? 'border-olive bg-olive text-on-brand'
                    : 'border-border-subtle bg-surface-card text-earth hover:bg-surface-hover'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2" aria-label="Filter by submission type">
          {KIND_FILTERS.map((f) => {
            const active = kindFilter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setKindFilter(f.key)}
                className={`min-h-touch rounded-xl border px-3 py-1.5 text-caption font-semibold transition-colors ${
                  active
                    ? 'border-earth bg-earth text-on-brand'
                    : 'border-border-subtle bg-surface-card text-earth hover:bg-surface-hover'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {queueError ? <InlineError id={queueErrorId} message={queueError} /> : null}

      {loadingQueue ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SkeletonCard />
          <div className="lg:col-span-2">
            <SkeletonCard />
          </div>
        </div>
      ) : queue.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="Review queue is clear"
          description="No owner verifications or property listings match this filter right now."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Queue List */}
          <ul className="space-y-2.5" aria-label="Review items">
            {queue.map((item) => {
              const selected =
                selectedKey?.id === item.id && selectedKey?.kind === item.kind;
              const badge = getReviewStatusBadge(item.status);
              return (
                <li key={`${item.kind}-${item.id}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedKey({ kind: item.kind, id: item.id })}
                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-olive bg-ivory shadow-sm'
                        : 'border-border-subtle bg-surface-card hover:bg-surface-hover'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-micro font-bold uppercase tracking-wide text-olive">
                        {item.kind === 'VERIFICATION' ? (
                          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                        {item.kind === 'VERIFICATION' ? 'Verification' : 'Listing'}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-nano font-bold ${badge.badgeClass}`}
                      >
                        {badge.label}
                      </span>
                    </div>

                    <p className="mt-2 font-display text-heading-5 font-bold text-earth">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-caption text-earth/75">{item.subtitle}</p>
                    <p className="mt-2 flex items-center gap-1 text-micro text-earth/60">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {formatAccraTime(item.updatedAt)}
                    </p>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Detailed Inspector */}
          <section className="space-y-5 lg:col-span-2">
            {loadingDetail ? (
              <SkeletonCard />
            ) : !detail ? (
              <EmptyState
                icon={FileCheck2}
                title="Select a submission to inspect"
                description="Choose an item from the queue to inspect documents, rooms, prices, and record a decision."
              />
            ) : (
              <div className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
                {/* Header */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
                  <div>
                    <p className="text-micro font-bold uppercase tracking-wide text-olive">
                      {detail.kind === 'VERIFICATION'
                        ? 'Owner Identity & Property Verification'
                        : 'Property Listing Review'}
                    </p>
                    <h2 className="mt-1 font-display text-heading-3 font-bold text-earth">
                      {detail.kind === 'VERIFICATION'
                        ? detail.organizationName
                        : (detail.listing?.name ?? detail.organizationName)}
                    </h2>
                    <p className="mt-0.5 text-caption text-earth/75">
                      Organisation: <strong className="font-semibold">{detail.organizationName}</strong>
                    </p>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-micro font-bold ${getReviewStatusBadge(detail.status).badgeClass}`}
                  >
                    {getReviewStatusBadge(detail.status).label}
                  </span>
                </div>

                {/* Verification Detail */}
                {detail.kind === 'VERIFICATION' && detail.verificationCase ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-border-subtle bg-canvas p-4">
                      <p className="text-caption font-semibold text-earth/75">
                        Masked Ghana Card Number (AES-256 encrypted at rest)
                      </p>
                      <p className="mt-1 font-mono text-heading-5 font-bold text-earth">
                        {detail.verificationCase.maskedGhanaCardNumber}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-label font-bold text-earth">
                        Private Verification Documents (5-min expiring secure links)
                      </h3>
                      <ul className="mt-2 space-y-2">
                        {detail.verificationCase.documents.map((doc) => {
                          const docChecked = rejectedDocTypes.includes(doc.documentType);
                          return (
                            <li
                              key={doc.id}
                              className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-canvas p-3.5 sm:flex-row sm:items-center sm:justify-between"
                            >
                              <div>
                                <p className="text-body-2 font-bold text-earth">
                                  {getDocumentLabel(doc.documentType)}
                                </p>
                                <p className="text-caption text-earth/75">
                                  Status: <strong className="font-semibold">{doc.status}</strong>
                                </p>
                                {doc.fixNote ? (
                                  <p className="mt-1 text-caption text-status-warning-fg">
                                    Prior note: {doc.fixNote}
                                  </p>
                                ) : null}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {isPendingItem && canDecide ? (
                                  <label className="inline-flex min-h-touch cursor-pointer items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-3 py-1.5 text-caption font-medium text-earth">
                                    <input
                                      type="checkbox"
                                      checked={docChecked}
                                      onChange={() => toggleRejectedDoc(doc.documentType)}
                                    />
                                    Flag for fix
                                  </label>
                                ) : null}

                                {doc.mediaAssetId ? (
                                  <button
                                    type="button"
                                    disabled={openingAssetId === doc.mediaAssetId}
                                    onClick={() => void handleOpenPrivateDoc(doc.mediaAssetId as string)}
                                    className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-card px-3.5 py-1.5 text-caption font-semibold text-earth hover:bg-surface-hover disabled:opacity-50"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
                                    {openingAssetId === doc.mediaAssetId ? 'Signing…' : 'Inspect Securely'}
                                  </button>
                                ) : null}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                ) : null}

                {/* Listing Detail */}
                {detail.kind === 'LISTING' && detail.listing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 rounded-xl border border-border-subtle bg-canvas p-4 sm:grid-cols-2">
                      <div>
                        <p className="text-micro font-bold uppercase text-earth/65">Location</p>
                        <p className="mt-1 flex items-center gap-1 text-body-2 font-semibold text-earth">
                          <MapPin className="h-4 w-4 text-olive" aria-hidden="true" />
                          {detail.listing.areaName ? `${detail.listing.areaName}, ` : ''}
                          {detail.listing.town}
                        </p>
                        {detail.listing.address ? (
                          <p className="mt-0.5 text-caption text-earth/75">
                            {detail.listing.address}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <p className="text-micro font-bold uppercase text-earth/65">
                          Starting Nightly Price
                        </p>
                        <p className="mt-1 font-display text-heading-4 font-bold text-earth">
                          {formatGhsPesewas(detail.listing.fromPricePesewas)}
                        </p>
                        <p className="text-caption text-earth/75">
                          Type: {detail.listing.accommodationTypeCode ?? '—'} ·{' '}
                          {detail.units.length} unit(s)
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-label font-bold text-earth">Description</h3>
                      <p className="text-body-2 text-earth/85 whitespace-pre-line">
                        {detail.listing.description ?? 'No description provided.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-label font-bold text-earth">House Rules</h3>
                      <p className="rounded-xl border border-border-subtle bg-canvas p-3 text-body-2 text-earth/85 whitespace-pre-line">
                        {detail.listing.houseRules ?? 'No house rules provided.'}
                      </p>
                    </div>

                    {detail.units.length > 0 ? (
                      <div>
                        <h3 className="text-label font-bold text-earth">Rooms &amp; Pricing</h3>
                        <ul className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {detail.units.map((u) => (
                            <li
                              key={u.unitId}
                              className="flex items-center justify-between rounded-xl border border-border-subtle bg-canvas p-3"
                            >
                              <div>
                                <p className="text-body-2 font-bold text-earth">{u.name}</p>
                                <p className="text-caption text-earth/75">
                                  Max {u.maxGuests} guests · Qty {u.quantity}
                                </p>
                              </div>
                              <span className="text-body-2 font-bold text-olive">
                                {formatGhsPesewas(u.nightlyRatePesewas)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {detail.listingPhotos.length > 0 ? (
                      <div>
                        <h3 className="text-label font-bold text-earth">
                          Submitted Photos ({detail.listingPhotos.length})
                        </h3>
                        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {detail.listingPhotos.map((photo, idx) => (
                            <div
                              key={photo.assetId}
                              className="aspect-video overflow-hidden rounded-xl border border-border-subtle bg-surface-muted"
                            >
                              {photo.publicUrl ? (
                                <img
                                  src={photo.publicUrl}
                                  alt={`Submitted photo ${idx + 1}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {actionError ? <InlineError id={actionErrorId} message={actionError} /> : null}

                {/* Three-Way Decision Controls for PENDING items */}
                {isPendingItem && canDecide ? (
                  <div className="space-y-4 border-t border-border-subtle pt-4">
                    <h3 className="font-display text-heading-5 font-bold text-earth">
                      Record Review Decision
                    </h3>

                    <div>
                      <label htmlFor={reasonId} className="block text-caption font-semibold text-earth">
                        Written Reason / Reviewer Notes (required for Corrections &amp; Reject)
                      </label>
                      <textarea
                        id={reasonId}
                        rows={3}
                        value={decisionReason}
                        onChange={(e) => setDecisionReason(e.target.value)}
                        placeholder="Explain your approval note, required corrections, or rejection reason..."
                        className="mt-1 w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 text-body-2 text-earth"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={correctionsId}
                        className="block text-caption font-semibold text-earth"
                      >
                        Specific Fix Checklist (optional, one item per line — used when requesting corrections)
                      </label>
                      <textarea
                        id={correctionsId}
                        rows={2}
                        value={correctionLinesRaw}
                        onChange={(e) => setCorrectionLinesRaw(e.target.value)}
                        placeholder="e.g. Upload higher-resolution photo of GTA licence"
                        className="mt-1 w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
                      />
                    </div>

                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleDecision('APPROVE')}
                        className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-olive px-5 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        {detail.kind === 'LISTING' ? 'Approve & Publish' : 'Approve Owner'}
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleDecision('REQUEST_CORRECTIONS')}
                        className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-status-warning-border bg-status-warning-bg px-4 py-2.5 text-body-2 font-semibold text-status-warning-fg hover:bg-sand/40 disabled:opacity-50"
                      >
                        <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                        Request Corrections
                      </button>

                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleDecision('REJECT')}
                        className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-status-error-border bg-status-error-bg px-4 py-2.5 text-body-2 font-semibold text-status-error-fg hover:bg-surface-hover disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Reject
                      </button>
                    </div>
                  </div>
                ) : null}

                {/* Suspend / Restore Controls for Live or Suspended Listings */}
                {canSuspendListing || canRestoreListing ? (
                  <div className="space-y-3 border-t border-border-subtle pt-4">
                    <h3 className="font-display text-heading-5 font-bold text-earth">
                      Listing Moderation
                    </h3>
                    <div>
                      <label
                        htmlFor={moderationReasonId}
                        className="block text-caption font-semibold text-earth"
                      >
                        Mandatory Written Reason *
                      </label>
                      <textarea
                        id={moderationReasonId}
                        rows={2}
                        value={moderationReason}
                        onChange={(e) => setModerationReason(e.target.value)}
                        placeholder={
                          canSuspendListing
                            ? 'Explain why this published listing is being suspended...'
                            : 'Explain why this suspended listing is cleared for restoration...'
                        }
                        className="mt-1 w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
                      />
                    </div>
                    {canSuspendListing ? (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleModeration('SUSPEND')}
                        className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-status-error-border bg-status-error-bg px-4 py-2.5 text-body-2 font-semibold text-status-error-fg hover:bg-surface-hover disabled:opacity-50"
                      >
                        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                        Suspend Published Listing
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleModeration('RESTORE')}
                        className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-olive px-5 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
                      >
                        <RotateCcw className="h-4 w-4" aria-hidden="true" />
                        Restore Listing to Active
                      </button>
                    )}
                  </div>
                ) : null}

                {/* Prior Review Decisions */}
                {detail.decisions.length > 0 ? (
                  <div className="border-t border-border-subtle pt-4">
                    <h3 className="text-label font-bold text-earth">Review Decision History</h3>
                    <ol className="mt-2 space-y-2.5">
                      {detail.decisions.map((d) => (
                        <li key={d.id} className="border-l-2 border-olive/40 pl-3">
                          <p className="text-caption font-bold text-earth">{d.decision}</p>
                          {d.reason ? (
                            <p className="mt-0.5 text-caption text-earth/85">{d.reason}</p>
                          ) : null}
                          {d.corrections.length > 0 ? (
                            <ul className="mt-1 list-disc pl-4 text-caption text-earth/80">
                              {d.corrections.map((c, idx) => (
                                <li key={idx}>{c}</li>
                              ))}
                            </ul>
                          ) : null}
                          <p className="mt-0.5 text-micro text-earth/60">
                            {formatAccraTime(d.decidedAt)}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};
