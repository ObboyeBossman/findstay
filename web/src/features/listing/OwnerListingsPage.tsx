import React, { useCallback, useEffect, useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  MapPin,
  PauseCircle,
  PencilLine,
  PlayCircle,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { EmptyState, InlineError, SkeletonCard, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import { fetchOwnerOrganization } from '../organization';
import {
  createOwnerProperty,
  fetchCatalogReference,
  fetchOwnerProperties,
  pauseOwnerProperty,
  resumeOwnerProperty,
} from './api';
import { formatGhsPesewas, getPropertyStatusMeta } from './pricing';
import type {
  CatalogReferenceResponse,
  PropertyListItemResponse,
  PropertyStatus,
} from './types';

type FilterTab = 'ALL' | PropertyStatus;

const FILTER_TABS: Array<{ key: FilterTab; label: string }> = [
  { key: 'ALL', label: 'All' },
  { key: 'DRAFT', label: 'Drafts' },
  { key: 'PENDING_REVIEW', label: 'Pending Review' },
  { key: 'CORRECTIONS_REQUESTED', label: 'Needs Fixes' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PAUSED', label: 'Paused' },
];

/**
 * Owner Listings List (`SCR-07B`, `S1-13-T5`):
 * - Displays verified-owner gate banner (`BR-02`) linking to `/owner/verification` when unverified.
 * - Lists organisation properties with cover image, Takoradi area, status pill, unit count, and lowest GHS nightly price.
 * - Supports quick creation of a new property draft (verified owners) and Pause / Resume actions.
 */
export const OwnerListingsPage: React.FC = () => {
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const nameInputId = useId();
  const typeSelectId = useId();
  const areaSelectId = useId();
  const townInputId = useId();
  const createErrorId = useId();
  const loadErrorId = useId();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [properties, setProperties] = useState<PropertyListItemResponse[]>([]);
  const [reference, setReference] = useState<CatalogReferenceResponse | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string>('NOT_SUBMITTED');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [busyPropertyId, setBusyPropertyId] = useState<string | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newTypeCode, setNewTypeCode] = useState('SUITE');
  const [newTown, setNewTown] = useState('Takoradi');
  const [newAreaId, setNewAreaId] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const canWrite = hasPermission('listing.write');
  const isVerifiedOwner = verificationStatus === 'APPROVED';

  const loadData = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [propsList, refData, orgProfile] = await Promise.all([
        fetchOwnerProperties(token),
        fetchCatalogReference(),
        fetchOwnerOrganization(token).catch(() => null),
      ]);
      setProperties(propsList);
      setReference(refData);
      if (refData.accommodationTypes.length > 0) {
        setNewTypeCode((prev) =>
          refData.accommodationTypes.some((t) => t.code === prev)
            ? prev
            : refData.accommodationTypes[0].code,
        );
      }
      if (orgProfile?.verificationStatus) {
        setVerificationStatus(orgProfile.verificationStatus);
      }
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load your properties.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token) return;
    if (!newName.trim()) {
      setCreateError('Enter a property name to create your draft.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createOwnerProperty(token, {
        name: newName.trim(),
        accommodationTypeCode: newTypeCode,
        town: newTown.trim() || 'Takoradi',
        areaId: newAreaId || null,
      });
      showToast({
        variant: 'success',
        title: 'Property draft created',
        message: `${created.name} is ready for room pricing, amenities, and photos.`,
      });
      navigate(`/owner/listings/${created.id}/edit`);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Unable to create property.');
    } finally {
      setCreating(false);
    }
  };

  const handlePauseToggle = async (item: PropertyListItemResponse) => {
    const token = session?.access_token;
    if (!token) return;
    setBusyPropertyId(item.id);
    try {
      const updated =
        item.status === 'ACTIVE'
          ? await pauseOwnerProperty(token, item.id)
          : await resumeOwnerProperty(token, item.id);
      setProperties((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, status: updated.status } : p)),
      );
      showToast({
        variant: 'success',
        title: updated.status === 'PAUSED' ? 'Listing paused' : 'Listing resumed',
        message:
          updated.status === 'PAUSED'
            ? `${item.name} is temporarily hidden from guest search.`
            : `${item.name} is live in guest search again.`,
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Status update failed',
        message: err instanceof Error ? err.message : 'Unable to update listing status.',
      });
    } finally {
      setBusyPropertyId(null);
    }
  };

  const filteredProperties =
    filterTab === 'ALL' ? properties : properties.filter((p) => p.status === filterTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-heading-2 font-bold text-earth">My Listings</h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Create and manage your Takoradi properties, rooms, nightly GHS prices, and photos.
          </p>
        </div>

        {canWrite ? (
          <button
            type="button"
            disabled={!isVerifiedOwner}
            onClick={() => setShowCreateForm((prev) => !prev)}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl bg-olive px-5 py-2.5 text-body-2 font-semibold text-on-brand shadow-sm transition-colors hover:bg-olive-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            {showCreateForm ? 'Close Draft Form' : 'Create Property'}
          </button>
        ) : null}
      </div>

      {!loading && !isVerifiedOwner ? (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border border-status-warning-border bg-status-warning-bg p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-status-warning-fg"
              aria-hidden="true"
            />
            <div>
              <p className="text-body-2 font-semibold text-status-warning-fg">
                Owner verification required to publish listings
              </p>
              <p className="mt-0.5 text-caption text-earth/80">
                Current verification status: <strong className="font-semibold">{verificationStatus}</strong>.
                Complete your Ghana Card, ownership proof, and GTA licence check to unlock property creation.
              </p>
            </div>
          </div>
          <Link
            to="/owner/verification"
            className="inline-flex min-h-touch shrink-0 items-center justify-center gap-2 rounded-xl border border-status-warning-border bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover"
          >
            <ShieldCheck className="h-4 w-4 text-olive" aria-hidden="true" />
            Go to Verification
          </Link>
        </div>
      ) : null}

      {showCreateForm && isVerifiedOwner ? (
        <form
          onSubmit={(e) => void handleCreateProperty(e)}
          className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm"
        >
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-olive" aria-hidden="true" />
            <h2 className="font-display text-heading-4 font-bold text-earth">
              Start a new property draft
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={nameInputId} className="block text-label font-semibold text-earth">
                Property name *
              </label>
              <input
                id={nameInputId}
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Atlantic Breeze Residence"
                className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
              />
            </div>

            <div>
              <label htmlFor={typeSelectId} className="block text-label font-semibold text-earth">
                Accommodation type *
              </label>
              <select
                id={typeSelectId}
                value={newTypeCode}
                onChange={(e) => setNewTypeCode(e.target.value)}
                className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
              >
                {(reference?.accommodationTypes ?? []).map((type) => (
                  <option key={type.id} value={type.code}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={townInputId} className="block text-label font-semibold text-earth">
                Town / City *
              </label>
              <input
                id={townInputId}
                type="text"
                required
                value={newTown}
                onChange={(e) => setNewTown(e.target.value)}
                className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
              />
            </div>

            <div>
              <label htmlFor={areaSelectId} className="block text-label font-semibold text-earth">
                Takoradi pilot area
              </label>
              <select
                id={areaSelectId}
                value={newAreaId}
                onChange={(e) => setNewAreaId(e.target.value)}
                className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
              >
                <option value="">Choose later in editor</option>
                {(reference?.areas ?? []).map((area) => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {createError ? (
            <div className="mt-4">
              <InlineError id={createErrorId} message={createError} />
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex min-h-touch items-center justify-center rounded-xl bg-olive px-5 py-2 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
            >
              {creating ? 'Creating draft…' : 'Create & Open Editor'}
            </button>
          </div>
        </form>
      ) : null}

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter listings by status">
        {FILTER_TABS.map((tab) => {
          const active = filterTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilterTab(tab.key)}
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

      {loadError ? <InlineError id={loadErrorId} message={loadError} /> : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : filteredProperties.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={
            properties.length === 0
              ? 'No properties listed yet'
              : 'No properties match this status filter'
          }
          description={
            isVerifiedOwner
              ? 'Start your first property draft to add rooms, nightly GHS prices, amenities, and WebP photos.'
              : 'Once your owner verification is approved, you can create properties and submit them for listing review.'
          }
          actionLabel={isVerifiedOwner && canWrite ? 'Create Property' : undefined}
          onAction={isVerifiedOwner && canWrite ? () => setShowCreateForm(true) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredProperties.map((property) => {
            const statusMeta = getPropertyStatusMeta(property.status);
            const isBusy = busyPropertyId === property.id;
            return (
              <article
                key={property.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface-card shadow-sm"
              >
                <div className="relative aspect-video bg-sand/30">
                  {property.coverPhotoUrl ? (
                    <img
                      src={property.coverPhotoUrl}
                      alt={property.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-earth/60">
                      <Building2 className="h-8 w-8" aria-hidden="true" />
                      <span className="text-caption font-medium">No cover photo yet</span>
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-micro font-bold ${statusMeta.badgeClass}`}
                  >
                    {property.status === 'ACTIVE' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : null}
                    {statusMeta.label}
                  </span>
                </div>

                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-display text-heading-4 font-bold text-earth">
                          {property.name}
                        </h2>
                        <p className="mt-1 flex items-center gap-1 text-caption text-earth/75">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-olive" aria-hidden="true" />
                          <span>
                            {property.areaName ? `${property.areaName}, ` : ''}
                            {property.town}
                          </span>
                          {property.accommodationTypeName ? (
                            <span> · {property.accommodationTypeName}</span>
                          ) : null}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-heading-5 font-bold text-earth">
                          {formatGhsPesewas(property.fromPricePesewas)}
                        </p>
                        <p className="text-micro text-earth/70">per night · {property.unitCount} unit{property.unitCount === 1 ? '' : 's'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle pt-3">
                    <Link
                      to={`/owner/listings/${property.id}/edit`}
                      className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover"
                    >
                      <PencilLine className="h-4 w-4 text-olive" aria-hidden="true" />
                      Edit &amp; Manage
                    </Link>

                    {canWrite && (property.status === 'ACTIVE' || property.status === 'PAUSED') ? (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void handlePauseToggle(property)}
                        className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 font-semibold text-earth transition-colors hover:bg-surface-hover disabled:opacity-50"
                      >
                        {property.status === 'ACTIVE' ? (
                          <>
                            <PauseCircle className="h-4 w-4 text-terracotta-dark" aria-hidden="true" />
                            Pause
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 text-olive" aria-hidden="true" />
                            Resume
                          </>
                        )}
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
