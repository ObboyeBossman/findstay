import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BedDouble,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  Lock,
  MapPin,
  PauseCircle,
  PlayCircle,
  Plus,
  Save,
  Send,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { InlineError, SkeletonCard, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import { PhotoUploader } from '../media';
import type { ManagedPhotoItem } from '../media';
import {
  addPropertyUnit,
  deletePropertyUnit,
  fetchCatalogReference,
  fetchOwnerPropertyDetail,
  pauseOwnerProperty,
  resumeOwnerProperty,
  submitOwnerProperty,
  syncPropertyPhotos,
  updateOwnerProperty,
  updatePropertyUnit,
} from './api';
import {
  evaluateSubmissionChecklist,
  formatGhsPesewas,
  getPropertyStatusMeta,
  parseCedisToPesewas,
  pesewasToCedisInput,
} from './pricing';
import type {
  CatalogReferenceResponse,
  PropertyDetailResponse,
  PropertyPhotoResponse,
  UnitResponse,
} from './types';

function formatAccraTimestamp(iso: string | null | undefined): string {
  if (!iso) return '—';
  try {
    return `${new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Accra',
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))} GMT`;
  } catch {
    return iso;
  }
}

function toManagedPhotos(photos: PropertyPhotoResponse[]): ManagedPhotoItem[] {
  return photos.map((p) => ({
    assetId: p.assetId,
    documentId: p.documentId,
    publicUrl: p.publicUrl ?? '',
    storageKey: p.documentId,
    sizeBytes: 0,
    isCover: p.isCover,
    position: p.position,
  }));
}

/**
 * Property & Units Editor, Photo Manager, Guest Preview & Submission Tracker
 * (`SCR-11`, `SCR-11B`, `SCR-12`, `SCR-11C`, `SCR-13`, `S1-13-T5`).
 */
export const PropertyEditorPage: React.FC = () => {
  const { propertyId } = useParams<{ propertyId: string }>();
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();

  const nameId = useId();
  const typeId = useId();
  const townId = useId();
  const areaIdField = useId();
  const addressId = useId();
  const latId = useId();
  const lngId = useId();
  const descId = useId();
  const rulesId = useId();

  const unitNameId = useId();
  const unitCatId = useId();
  const unitGuestsId = useId();
  const unitQtyId = useId();
  const unitPriceId = useId();
  const loadErrorId = useId();
  const detailsErrorId = useId();
  const unitErrorId = useId();
  const submitErrorId = useId();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [property, setProperty] = useState<PropertyDetailResponse | null>(null);
  const [reference, setReference] = useState<CatalogReferenceResponse | null>(null);

  // Section A & B form state
  const [name, setName] = useState('');
  const [accommodationTypeCode, setAccommodationTypeCode] = useState('');
  const [town, setTown] = useState('Takoradi');
  const [areaId, setAreaId] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [houseRules, setHouseRules] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [savingDetails, setSavingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  // Section C unit form state
  const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitCategory, setUnitCategory] = useState('');
  const [unitMaxGuests, setUnitMaxGuests] = useState('2');
  const [unitQuantity, setUnitQuantity] = useState('1');
  const [unitPriceCedis, setUnitPriceCedis] = useState('');
  const [savingUnit, setSavingUnit] = useState(false);
  const [unitError, setUnitError] = useState<string | null>(null);

  // Section D photo sync state
  const [managedPhotos, setManagedPhotos] = useState<ManagedPhotoItem[]>([]);
  const [syncingPhotos, setSyncingPhotos] = useState(false);

  // Section E preview & submission state
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [togglingPause, setTogglingPause] = useState(false);

  const canWrite = hasPermission('listing.write');
  const canSubmit = hasPermission('listing.submit');
  const isLockedUnderReview = property?.status === 'PENDING_REVIEW';
  const readOnly = !canWrite || isLockedUnderReview;

  const hydrateFromDetail = useCallback((detail: PropertyDetailResponse) => {
    setProperty(detail);
    setName(detail.name);
    setAccommodationTypeCode(detail.accommodationTypeCode ?? '');
    setTown(detail.town);
    setAreaId(detail.areaId ?? '');
    setAddress(detail.address ?? '');
    setLatitude(detail.latitude !== null ? String(detail.latitude) : '');
    setLongitude(detail.longitude !== null ? String(detail.longitude) : '');
    setDescription(detail.description ?? '');
    setHouseRules(detail.houseRules ?? '');
    setSelectedAmenities(detail.amenityCodes ?? []);
    setManagedPhotos(toManagedPhotos(detail.photos ?? []));
  }, []);

  const loadAll = useCallback(async () => {
    const token = session?.access_token;
    if (!token || !propertyId) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [detail, refData] = await Promise.all([
        fetchOwnerPropertyDetail(token, propertyId),
        fetchCatalogReference(),
      ]);
      setReference(refData);
      hydrateFromDetail(detail);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load property.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, propertyId, hydrateFromDetail]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const checklist = useMemo(
    () =>
      evaluateSubmissionChecklist({
        description,
        areaId: areaId || null,
        address,
        houseRules,
        units: property?.units ?? [],
        photos: managedPhotos.filter((p) => Boolean(p.documentId)).map((p) => ({
          documentId: p.documentId as string,
        })),
      }),
    [description, areaId, address, houseRules, property?.units, managedPhotos],
  );

  const allChecklistGreen = checklist.every((item) => item.complete);

  const amenityNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    for (const a of reference?.amenities ?? []) {
      map.set(a.code, a.name);
    }
    return map;
  }, [reference?.amenities]);

  const areaName = useMemo(() => {
    const found = reference?.areas.find((a) => a.id === areaId);
    return found?.name ?? property?.areaName ?? null;
  }, [reference?.areas, areaId, property?.areaName]);

  const toggleAmenity = (code: string) => {
    if (readOnly) return;
    setSelectedAmenities((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token || !propertyId || readOnly) return;
    setSavingDetails(true);
    setDetailsError(null);

    const parsedLat = latitude.trim() ? Number(latitude.trim()) : null;
    const parsedLng = longitude.trim() ? Number(longitude.trim()) : null;
    if (parsedLat !== null && (Number.isNaN(parsedLat) || parsedLat < -90 || parsedLat > 90)) {
      setDetailsError('Latitude must be between -90 and 90.');
      setSavingDetails(false);
      return;
    }
    if (parsedLng !== null && (Number.isNaN(parsedLng) || parsedLng < -180 || parsedLng > 180)) {
      setDetailsError('Longitude must be between -180 and 180.');
      setSavingDetails(false);
      return;
    }

    try {
      const updated = await updateOwnerProperty(token, propertyId, {
        name: name.trim(),
        accommodationTypeCode: accommodationTypeCode || undefined,
        town: town.trim(),
        areaId: areaId || null,
        address: address.trim(),
        latitude: parsedLat,
        longitude: parsedLng,
        description: description.trim(),
        houseRules: houseRules.trim(),
        amenityCodes: selectedAmenities,
      });
      hydrateFromDetail(updated);
      showToast({
        variant: 'success',
        title: 'Property details saved',
        message: 'Your draft changes have been saved.',
      });
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : 'Unable to save property details.');
    } finally {
      setSavingDetails(false);
    }
  };

  const resetUnitForm = () => {
    setEditingUnitId(null);
    setUnitName('');
    setUnitCategory('');
    setUnitMaxGuests('2');
    setUnitQuantity('1');
    setUnitPriceCedis('');
    setUnitError(null);
  };

  const startEditUnit = (unit: UnitResponse) => {
    setEditingUnitId(unit.id);
    setUnitName(unit.name);
    setUnitCategory(unit.category ?? '');
    setUnitMaxGuests(String(unit.maxGuests));
    setUnitQuantity(String(unit.quantity));
    setUnitPriceCedis(pesewasToCedisInput(unit.nightlyRatePesewas));
    setUnitError(null);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token || !propertyId || readOnly) return;

    const pesewas = parseCedisToPesewas(unitPriceCedis);
    const maxGuests = Number.parseInt(unitMaxGuests, 10);
    const quantity = Number.parseInt(unitQuantity, 10);

    if (!unitName.trim()) {
      setUnitError('Enter a room or unit name.');
      return;
    }
    if (!Number.isInteger(maxGuests) || maxGuests < 1) {
      setUnitError('Max guests must be at least 1.');
      return;
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      setUnitError('Quantity must be at least 1.');
      return;
    }
    if (pesewas === null) {
      setUnitError('Enter a valid positive nightly rate in GHS (up to 2 decimal places, e.g. 450.50).');
      return;
    }

    setSavingUnit(true);
    setUnitError(null);
    try {
      if (editingUnitId) {
        await updatePropertyUnit(token, propertyId, editingUnitId, {
          name: unitName.trim(),
          category: unitCategory.trim(),
          maxGuests,
          quantity,
          nightlyRatePesewas: pesewas,
        });
      } else {
        await addPropertyUnit(token, propertyId, {
          name: unitName.trim(),
          category: unitCategory.trim() || undefined,
          maxGuests,
          quantity,
          nightlyRatePesewas: pesewas,
        });
      }
      const refreshed = await fetchOwnerPropertyDetail(token, propertyId);
      hydrateFromDetail(refreshed);
      resetUnitForm();
      showToast({
        variant: 'success',
        title: editingUnitId ? 'Unit updated' : 'Unit added',
        message: `${unitName.trim()} saved at ${formatGhsPesewas(pesewas)}/night.`,
      });
    } catch (err) {
      setUnitError(err instanceof Error ? err.message : 'Unable to save unit.');
    } finally {
      setSavingUnit(false);
    }
  };

  const handleDeleteUnit = async (unit: UnitResponse) => {
    const token = session?.access_token;
    if (!token || !propertyId || readOnly) return;
    try {
      await deletePropertyUnit(token, propertyId, unit.id);
      const refreshed = await fetchOwnerPropertyDetail(token, propertyId);
      hydrateFromDetail(refreshed);
      if (editingUnitId === unit.id) {
        resetUnitForm();
      }
      showToast({
        variant: 'success',
        title: 'Unit removed',
        message: `${unit.name} has been removed from this property.`,
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Could not remove unit',
        message: err instanceof Error ? err.message : 'Try again.',
      });
    }
  };

  const handlePhotosChange = async (nextPhotos: ManagedPhotoItem[]) => {
    setManagedPhotos(nextPhotos);
    const token = session?.access_token;
    if (!token || !propertyId || readOnly) return;

    const payload = nextPhotos
      .filter((p) => Boolean(p.documentId))
      .map((p, idx) => ({
        documentId: p.documentId as string,
        position: idx,
        isCover: p.isCover,
      }));

    setSyncingPhotos(true);
    try {
      await syncPropertyPhotos(token, propertyId, payload);
      const refreshed = await fetchOwnerPropertyDetail(token, propertyId);
      setProperty(refreshed);
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Photo order not saved',
        message: err instanceof Error ? err.message : 'Unable to sync photo order.',
      });
    } finally {
      setSyncingPhotos(false);
    }
  };

  const handleSubmitForReview = async () => {
    const token = session?.access_token;
    if (!token || !propertyId || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await submitOwnerProperty(token, propertyId);
      hydrateFromDetail(updated);
      showToast({
        variant: 'success',
        title: 'Listing submitted for review',
        message: `${updated.name} is now queued for admin approval.`,
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePauseResume = async () => {
    const token = session?.access_token;
    if (!token || !propertyId || !property) return;
    setTogglingPause(true);
    try {
      const updated =
        property.status === 'ACTIVE'
          ? await pauseOwnerProperty(token, propertyId)
          : await resumeOwnerProperty(token, propertyId);
      hydrateFromDetail(updated);
      showToast({
        variant: 'success',
        title: updated.status === 'PAUSED' ? 'Listing paused' : 'Listing resumed',
        message:
          updated.status === 'PAUSED'
            ? 'Your listing is paused and hidden from guest search.'
            : 'Your listing is live again.',
      });
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Status change failed',
        message: err instanceof Error ? err.message : 'Unable to change listing status.',
      });
    } finally {
      setTogglingPause(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (loadError || !property) {
    return (
      <div className="space-y-4">
        <Link
          to="/owner/listings"
          className="inline-flex min-h-touch items-center gap-2 text-body-2 font-semibold text-olive hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to My Listings
        </Link>
        <InlineError id={loadErrorId} message={loadError ?? 'Property not found.'} />
      </div>
    );
  }

  const statusMeta = getPropertyStatusMeta(property.status);
  const canBeSubmitted =
    canSubmit &&
    (property.status === 'DRAFT' || property.status === 'CORRECTIONS_REQUESTED');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to="/owner/listings"
            className="inline-flex items-center gap-1.5 text-caption font-semibold text-olive hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to My Listings
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-heading-2 font-bold text-earth">{property.name}</h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-micro font-bold ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover"
          >
            <Eye className="h-4 w-4 text-olive" aria-hidden="true" />
            {showPreview ? 'Hide Guest Preview' : 'Guest Preview'}
          </button>

          {canWrite && (property.status === 'ACTIVE' || property.status === 'PAUSED') ? (
            <button
              type="button"
              disabled={togglingPause}
              onClick={() => void handlePauseResume()}
              className="inline-flex min-h-touch items-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover disabled:opacity-50"
            >
              {property.status === 'ACTIVE' ? (
                <>
                  <PauseCircle className="h-4 w-4 text-terracotta-dark" aria-hidden="true" />
                  Pause Listing
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 text-olive" aria-hidden="true" />
                  Resume Listing
                </>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {isLockedUnderReview ? (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-status-info-border bg-status-info-bg p-4"
        >
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-status-info-fg" aria-hidden="true" />
          <div>
            <p className="text-body-2 font-semibold text-status-info-fg">
              Locked while under administrator review
            </p>
            <p className="mt-0.5 text-caption text-earth/80">
              Edits are paused until the FindStay review team approves your listing or requests corrections.
            </p>
          </div>
        </div>
      ) : null}

      {showPreview ? (
        <section
          aria-label="Guest listing preview"
          className="rounded-2xl border border-olive bg-ivory p-5 shadow-sm"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-olive" aria-hidden="true" />
              <h2 className="font-display text-heading-4 font-bold text-earth">
                Guest Preview (How travellers will see your stay)
              </h2>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full border border-status-success-border bg-status-success-bg px-3 py-1 text-micro font-bold text-status-success-fg">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified Owner
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {managedPhotos.length > 0 ? (
                <div className="aspect-video overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted">
                  <img
                    src={
                      (managedPhotos.find((p) => p.isCover) ?? managedPhotos[0]).publicUrl
                    }
                    alt={`${name} cover`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-muted text-caption text-earth/70">
                  Upload a cover photo to preview gallery imagery
                </div>
              )}

              <div>
                <h3 className="font-display text-heading-3 font-bold text-earth">{name}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-body-2 text-earth/75">
                  <MapPin className="h-4 w-4 text-olive" aria-hidden="true" />
                  <span>
                    {areaName ? `${areaName}, ` : ''}
                    {town}
                    {address ? ` — ${address}` : ''}
                  </span>
                </p>
              </div>

              <p className="text-body-2 text-earth/85 whitespace-pre-line">
                {description || 'Add a description so guests know what makes your property welcoming.'}
              </p>

              {selectedAmenities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAmenities.map((code) => (
                    <span
                      key={code}
                      className="rounded-full border border-border-subtle bg-surface-card px-3 py-1 text-caption font-medium text-earth"
                    >
                      {amenityNameByCode.get(code) ?? code}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="rounded-xl border border-border-subtle bg-surface-card p-4">
                <h4 className="text-label font-bold text-earth">House Rules</h4>
                <p className="mt-1 text-body-2 text-earth/80 whitespace-pre-line">
                  {houseRules || 'Add check-in/out times and guest house rules.'}
                </p>
              </div>
            </div>

            <div className="space-y-3 rounded-2xl border border-border-subtle bg-surface-card p-4">
              <p className="text-caption font-semibold uppercase tracking-wide text-earth/70">
                Starting from
              </p>
              <p className="font-display text-heading-2 font-bold text-earth">
                {formatGhsPesewas(property.fromPricePesewas)}
                <span className="text-caption font-normal text-earth/70"> / night</span>
              </p>

              <div className="space-y-2 border-t border-border-subtle pt-3">
                <p className="text-label font-semibold text-earth">Available Rooms &amp; Units</p>
                {property.units.length === 0 ? (
                  <p className="text-caption text-earth/70">No units added yet.</p>
                ) : (
                  property.units.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between rounded-xl border border-border-subtle bg-canvas p-3"
                    >
                      <div>
                        <p className="text-body-2 font-semibold text-earth">{u.name}</p>
                        <p className="text-caption text-earth/70">
                          Up to {u.maxGuests} guest{u.maxGuests === 1 ? '' : 's'} · {u.quantity} available
                        </p>
                      </div>
                      <p className="text-body-2 font-bold text-olive">
                        {formatGhsPesewas(u.nightlyRatePesewas)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Section A & B: Details, Location & Amenities */}
          <form
            onSubmit={(e) => void handleSaveDetails(e)}
            className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm"
          >
            <h2 className="font-display text-heading-4 font-bold text-earth">
              1. Property Details, Location &amp; Amenities
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor={nameId} className="block text-label font-semibold text-earth">
                  Property name *
                </label>
                <input
                  id={nameId}
                  type="text"
                  required
                  disabled={readOnly}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor={typeId} className="block text-label font-semibold text-earth">
                  Accommodation type *
                </label>
                <select
                  id={typeId}
                  disabled={readOnly}
                  value={accommodationTypeCode}
                  onChange={(e) => setAccommodationTypeCode(e.target.value)}
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                >
                  {(reference?.accommodationTypes ?? []).map((type) => (
                    <option key={type.id} value={type.code}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={townId} className="block text-label font-semibold text-earth">
                  Town / City *
                </label>
                <input
                  id={townId}
                  type="text"
                  required
                  disabled={readOnly}
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor={areaIdField} className="block text-label font-semibold text-earth">
                  Takoradi pilot area *
                </label>
                <select
                  id={areaIdField}
                  disabled={readOnly}
                  value={areaId}
                  onChange={(e) => setAreaId(e.target.value)}
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                >
                  <option value="">Select Takoradi area…</option>
                  {(reference?.areas ?? []).map((area) => (
                    <option key={area.id} value={area.id}>
                      {area.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor={addressId} className="block text-label font-semibold text-earth">
                  Street address or landmark *
                </label>
                <input
                  id={addressId}
                  type="text"
                  disabled={readOnly}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 14 Beach Road, near Atlantic Hotel"
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor={latId} className="block text-label font-semibold text-earth">
                  GPS Latitude (optional)
                </label>
                <input
                  id={latId}
                  type="text"
                  inputMode="decimal"
                  disabled={readOnly}
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="4.888420"
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                />
              </div>

              <div>
                <label htmlFor={lngId} className="block text-label font-semibold text-earth">
                  GPS Longitude (optional)
                </label>
                <input
                  id={lngId}
                  type="text"
                  inputMode="decimal"
                  disabled={readOnly}
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-1.755360"
                  className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={descId} className="block text-label font-semibold text-earth">
                  Property description *
                </label>
                <textarea
                  id={descId}
                  rows={4}
                  disabled={readOnly}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the property, neighbourhood, backup power/water reliability, and guest experience."
                  className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 text-body-2 text-earth disabled:opacity-60"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={rulesId} className="block text-label font-semibold text-earth">
                  House rules *
                </label>
                <textarea
                  id={rulesId}
                  rows={3}
                  disabled={readOnly}
                  value={houseRules}
                  onChange={(e) => setHouseRules(e.target.value)}
                  placeholder="Check-in/check-out times, smoking/pet policy, quiet hours, ID presentation."
                  className="mt-1.5 w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2.5 text-body-2 text-earth disabled:opacity-60"
                />
              </div>
            </div>

            <div className="mt-5">
              <p className="text-label font-semibold text-earth">Amenities</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(reference?.amenities ?? []).map((amenity) => {
                  const active = selectedAmenities.includes(amenity.code);
                  return (
                    <button
                      key={amenity.id}
                      type="button"
                      disabled={readOnly}
                      aria-pressed={active}
                      onClick={() => toggleAmenity(amenity.code)}
                      className={`inline-flex min-h-touch items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-caption font-semibold transition-colors disabled:opacity-60 ${
                        active
                          ? 'border-olive bg-olive text-on-brand'
                          : 'border-border-subtle bg-canvas text-earth hover:bg-surface-hover'
                      }`}
                    >
                      {active ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                      {amenity.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {detailsError ? (
              <div className="mt-4">
                <InlineError id={detailsErrorId} message={detailsError} />
              </div>
            ) : null}

            {!readOnly ? (
              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={savingDetails}
                  className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-olive px-5 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
                >
                  <Save className="h-4 w-4" aria-hidden="true" />
                  {savingDetails ? 'Saving…' : 'Save Property Details'}
                </button>
              </div>
            ) : null}
          </form>

          {/* Section C: Units & Nightly GHS Pricing */}
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-olive" aria-hidden="true" />
              <h2 className="font-display text-heading-4 font-bold text-earth">
                2. Rooms / Units &amp; Nightly GHS Pricing
              </h2>
            </div>
            <p className="mt-1 text-caption text-earth/75">
              Every room type has its own guest capacity, inventory count, and nightly price stored in exact GHS pesewas.
            </p>

            {property.units.length > 0 ? (
              <ul className="mt-4 space-y-2.5">
                {property.units.map((unit) => (
                  <li
                    key={unit.id}
                    className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-canvas p-3.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-body-2 font-bold text-earth">
                        {unit.name}
                        {unit.category ? (
                          <span className="ml-2 text-caption font-normal text-earth/70">
                            ({unit.category})
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-3 text-caption text-earth/75">
                        <span className="inline-flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
                          Max {unit.maxGuests} guest{unit.maxGuests === 1 ? '' : 's'}
                        </span>
                        <span>Qty: {unit.quantity}</span>
                        <span className="font-semibold text-earth">
                          {formatGhsPesewas(unit.nightlyRatePesewas)} / night
                        </span>
                      </p>
                    </div>

                    {!readOnly ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditUnit(unit)}
                          className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-surface-card px-3 py-1.5 text-caption font-semibold text-earth hover:bg-surface-hover"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteUnit(unit)}
                          aria-label={`Remove ${unit.name}`}
                          className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-surface-card px-3 py-1.5 text-caption font-semibold text-status-error-fg hover:bg-surface-hover"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 rounded-xl border border-dashed border-border-subtle bg-surface-muted/40 p-4 text-caption text-earth/75">
                No units added yet. Add at least one room or apartment below before submitting for review.
              </p>
            )}

            {!readOnly ? (
              <form
                onSubmit={(e) => void handleSaveUnit(e)}
                className="mt-5 rounded-xl border border-border-subtle bg-ivory/60 p-4"
              >
                <h3 className="text-label font-bold text-earth">
                  {editingUnitId ? 'Edit room / unit' : 'Add a room or unit'}
                </h3>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor={unitNameId} className="block text-caption font-semibold text-earth">
                      Unit name *
                    </label>
                    <input
                      id={unitNameId}
                      type="text"
                      required
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="e.g. Deluxe Ocean Room"
                      className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
                    />
                  </div>

                  <div>
                    <label htmlFor={unitCatId} className="block text-caption font-semibold text-earth">
                      Category (optional)
                    </label>
                    <input
                      id={unitCatId}
                      type="text"
                      value={unitCategory}
                      onChange={(e) => setUnitCategory(e.target.value)}
                      placeholder="e.g. Standard, Suite, 2-Bed"
                      className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
                    />
                  </div>

                  <div>
                    <label htmlFor={unitGuestsId} className="block text-caption font-semibold text-earth">
                      Max guests *
                    </label>
                    <input
                      id={unitGuestsId}
                      type="number"
                      min={1}
                      required
                      value={unitMaxGuests}
                      onChange={(e) => setUnitMaxGuests(e.target.value)}
                      className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
                    />
                  </div>

                  <div>
                    <label htmlFor={unitQtyId} className="block text-caption font-semibold text-earth">
                      Identical rooms count *
                    </label>
                    <input
                      id={unitQtyId}
                      type="number"
                      min={1}
                      required
                      value={unitQuantity}
                      onChange={(e) => setUnitQuantity(e.target.value)}
                      className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor={unitPriceId} className="block text-caption font-semibold text-earth">
                      Nightly price (GHS) *
                    </label>
                    <input
                      id={unitPriceId}
                      type="text"
                      inputMode="decimal"
                      required
                      value={unitPriceCedis}
                      onChange={(e) => setUnitPriceCedis(e.target.value)}
                      placeholder="e.g. 450.00"
                      className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
                    />
                  </div>
                </div>

                {unitError ? (
                  <div className="mt-3">
                    <InlineError id={unitErrorId} message={unitError} />
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  {editingUnitId ? (
                    <button
                      type="button"
                      onClick={resetUnitForm}
                      className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
                    >
                      Cancel Edit
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    disabled={savingUnit}
                    className="inline-flex min-h-touch items-center gap-1.5 rounded-xl bg-olive px-4 py-2 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" aria-hidden="true" />
                    {savingUnit ? 'Saving…' : editingUnitId ? 'Update Unit' : 'Add Unit'}
                  </button>
                </div>
              </form>
            ) : null}
          </section>

          {/* Section D: Photos */}
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-heading-4 font-bold text-earth">
                  3. Property Photos (Max 10, WebP)
                </h2>
                <p className="mt-0.5 text-caption text-earth/75">
                  Upload clear photos, choose your cover photo, and reorder how guests browse your gallery.
                </p>
              </div>
              {syncingPhotos ? (
                <span className="text-caption font-medium text-olive">Saving photo order…</span>
              ) : null}
            </div>

            <PhotoUploader
              ownerId={property.id}
              photos={managedPhotos}
              onChange={(next) => void handlePhotosChange(next)}
              disabled={readOnly}
            />
          </section>
        </div>

        {/* Right rail: Readiness Checklist, Submit & Status History */}
        <aside className="space-y-6">
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <h2 className="font-display text-heading-4 font-bold text-earth">
              Submission Readiness
            </h2>
            <p className="mt-1 text-caption text-earth/75">
              Complete all items below before submitting for FindStay admin review.
            </p>

            <ul className="mt-4 space-y-2.5">
              {checklist.map((item) => (
                <li key={item.id} className="flex items-start gap-2.5 text-body-2">
                  {item.complete ? (
                    <CheckCircle2
                      className="mt-0.5 h-4 w-4 shrink-0 text-status-success-fg"
                      aria-hidden="true"
                    />
                  ) : (
                    <Circle
                      className="mt-0.5 h-4 w-4 shrink-0 text-earth/40"
                      aria-hidden="true"
                    />
                  )}
                  <span className={item.complete ? 'text-earth' : 'text-earth/75'}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>

            {submitError ? (
              <div className="mt-4">
                <InlineError id={submitErrorId} message={submitError} />
              </div>
            ) : null}

            {canBeSubmitted ? (
              <button
                type="button"
                disabled={!allChecklistGreen || submitting}
                onClick={() => void handleSubmitForReview()}
                className="mt-5 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-terracotta-dark px-4 py-2.5 text-body-2 font-semibold text-on-brand shadow-sm transition-colors hover:bg-terracotta disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {submitting ? 'Submitting…' : 'Submit Listing for Review'}
              </button>
            ) : null}
          </section>

          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-olive" aria-hidden="true" />
              <h2 className="font-display text-heading-5 font-bold text-earth">
                Status History
              </h2>
            </div>

            {property.statusHistory.length === 0 ? (
              <p className="mt-3 text-caption text-earth/70">No status updates recorded yet.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {property.statusHistory.map((entry, idx) => (
                  <li
                    key={`${entry.createdAt}-${idx}`}
                    className="border-l-2 border-olive/40 pl-3"
                  >
                    <p className="text-caption font-bold text-earth">
                      {entry.fromStatus ? `${entry.fromStatus} → ${entry.toStatus}` : entry.toStatus}
                    </p>
                    {entry.reason ? (
                      <p className="mt-0.5 text-caption text-earth/80">{entry.reason}</p>
                    ) : null}
                    <p className="mt-0.5 text-micro text-earth/60">
                      {formatAccraTimestamp(entry.createdAt)}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
};
