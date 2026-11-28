import React, { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Plus,
  Trash2,
} from 'lucide-react';
import { EmptyState, InlineError, SkeletonCard, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import {
  fetchOwnerProperties,
  fetchOwnerPropertyDetail,
  formatGhsPesewas,
  type PropertyListItemResponse,
  type UnitResponse,
} from '../listing';
import {
  createUnitAvailabilityBlock,
  deleteUnitAvailabilityBlock,
  fetchUnitAvailability,
} from './api';
import {
  addDays,
  buildMondayFirstGrid,
  formatMonthHeading,
  getCurrentGhanaMonth,
  isDateInSelection,
  shiftMonth,
  validateBlockDateRange,
  WEEKDAY_HEADERS,
} from './calendar';
import type { AvailabilityBlockItem, AvailabilityCalendarResponse } from './types';

/**
 * Interactive Unit Availability Calendar (`SCR-14C`, `S1-14-T4`):
 * - Property & Unit selector (auto-selects `:propertyId` when opened from a listing)
 * - Month-by-month Ghana (`Africa/Accra`) calendar grid with accessible icon + text badges
 * - Tap-to-select date range or explicit date form to block unavailable nights
 * - One-click unblock on existing `OWNER_BLOCK` entries and clear `409 CONFLICT` overlap alerts
 */
export const OwnerCalendarPage: React.FC = () => {
  const { propertyId: routePropertyId } = useParams<{ propertyId?: string }>();
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();

  const propertySelectId = useId();
  const unitSelectId = useId();
  const startDateId = useId();
  const endDateId = useId();
  const reasonId = useId();
  const loadErrorId = useId();
  const formErrorId = useId();

  const [loadingProps, setLoadingProps] = useState(true);
  const [properties, setProperties] = useState<PropertyListItemResponse[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(routePropertyId ?? '');

  const [loadingUnits, setLoadingUnits] = useState(false);
  const [units, setUnits] = useState<UnitResponse[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  const [month, setMonth] = useState<string>(() => getCurrentGhanaMonth());
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [calendar, setCalendar] = useState<AvailabilityCalendarResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [highlightedBlockId, setHighlightedBlockId] = useState<string | null>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const canWrite = hasPermission('availability.write');

  // 1. Load properties accessible to this owner or staff member
  useEffect(() => {
    const token = session?.access_token;
    if (!token) return;
    let active = true;
    setLoadingProps(true);
    setLoadError(null);

    fetchOwnerProperties(token)
      .then((list) => {
        if (!active) return;
        setProperties(list);
        if (list.length > 0) {
          const preferred =
            routePropertyId && list.some((p) => p.id === routePropertyId)
              ? routePropertyId
              : list[0].id;
          setSelectedPropertyId(preferred);
        } else {
          setSelectedPropertyId('');
        }
      })
      .catch((err: unknown) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load properties.');
      })
      .finally(() => {
        if (active) setLoadingProps(false);
      });

    return () => {
      active = false;
    };
  }, [session?.access_token, routePropertyId]);

  // 2. Load units for the selected property
  useEffect(() => {
    const token = session?.access_token;
    if (!token || !selectedPropertyId) {
      setUnits([]);
      setSelectedUnitId('');
      setCalendar(null);
      return;
    }
    let active = true;
    setLoadingUnits(true);
    setLoadError(null);

    fetchOwnerPropertyDetail(token, selectedPropertyId)
      .then((detail) => {
        if (!active) return;
        setUnits(detail.units);
        setSelectedUnitId((prev) =>
          detail.units.some((u) => u.id === prev) ? prev : (detail.units[0]?.id ?? ''),
        );
      })
      .catch((err: unknown) => {
        if (!active) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load property units.');
      })
      .finally(() => {
        if (active) setLoadingUnits(false);
      });

    return () => {
      active = false;
    };
  }, [session?.access_token, selectedPropertyId]);

  // 3. Load month availability for the selected unit
  const loadCalendar = useCallback(async () => {
    const token = session?.access_token;
    if (!token || !selectedUnitId) {
      setCalendar(null);
      return;
    }
    setLoadingCalendar(true);
    setLoadError(null);
    try {
      const data = await fetchUnitAvailability(token, selectedUnitId, month);
      setCalendar(data);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Unable to load availability calendar.');
    } finally {
      setLoadingCalendar(false);
    }
  }, [session?.access_token, selectedUnitId, month]);

  useEffect(() => {
    void loadCalendar();
  }, [loadCalendar]);

  const gridCells = useMemo(
    () => (calendar ? buildMondayFirstGrid(calendar.month, calendar.days) : []),
    [calendar],
  );

  const selectedUnit = useMemo(
    () => units.find((u) => u.id === selectedUnitId) ?? null,
    [units, selectedUnitId],
  );

  const handleDayClick = (isoDate: string, state: string, blockId: string | null) => {
    setFormError(null);
    if (state === 'OWNER_BLOCKED' && blockId) {
      setHighlightedBlockId(blockId);
      return;
    }
    setHighlightedBlockId(null);
    if (!canWrite) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(isoDate);
      setEndDate(addDays(isoDate, 1));
      return;
    }

    if (isoDate > startDate) {
      setEndDate(addDays(isoDate, 1));
    } else {
      setStartDate(isoDate);
      setEndDate(addDays(isoDate, 1));
    }
  };

  const handleCreateBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token || !selectedUnitId || !canWrite) return;

    const validation = validateBlockDateRange(startDate, endDate);
    if (!validation.valid) {
      setFormError(validation.reason);
      return;
    }

    setSavingBlock(true);
    setFormError(null);
    try {
      await createUnitAvailabilityBlock(token, selectedUnitId, {
        startDate,
        endDate,
        reason: 'OWNER_BLOCK',
      });
      showToast({
        variant: 'success',
        title: 'Dates blocked',
        message: `Blocked ${validation.nights} night${validation.nights === 1 ? '' : 's'} (${startDate} to ${endDate}).`,
      });
      setStartDate('');
      setEndDate('');
      await loadCalendar();
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : 'Selected dates overlap an existing block. Refreshing calendar.',
      );
      await loadCalendar();
    } finally {
      setSavingBlock(false);
    }
  };

  const handleDeleteBlock = async (block: AvailabilityBlockItem) => {
    const token = session?.access_token;
    if (!token || !selectedUnitId || !canWrite) return;
    setDeletingBlockId(block.id);
    setFormError(null);
    try {
      await deleteUnitAvailabilityBlock(token, selectedUnitId, block.id);
      if (highlightedBlockId === block.id) {
        setHighlightedBlockId(null);
      }
      showToast({
        variant: 'success',
        title: 'Dates unblocked',
        message: `${block.startDate} to ${block.endDate} is available again.`,
      });
      await loadCalendar();
    } catch (err) {
      showToast({
        variant: 'error',
        title: 'Unable to remove block',
        message: err instanceof Error ? err.message : 'Please try again.',
      });
    } finally {
      setDeletingBlockId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-heading-2 font-bold text-earth">
            Room Availability Calendar
          </h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Block or unblock unavailable dates per room in Ghana time (Africa/Accra). Overlapping blocks are prevented automatically.
          </p>
        </div>

        <Link
          to="/owner/listings"
          className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover"
        >
          Manage Properties
        </Link>
      </div>

      {loadError ? <InlineError id={loadErrorId} message={loadError} /> : null}

      {loadingProps ? (
        <SkeletonCard />
      ) : properties.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No properties available yet"
          description="Create a property and add at least one room or unit before managing its availability calendar."
        />
      ) : (
        <>
          {/* Property & Unit Selector */}
          <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-sm sm:grid-cols-2">
            <div>
              <label htmlFor={propertySelectId} className="block text-label font-semibold text-earth">
                Property
              </label>
              <select
                id={propertySelectId}
                value={selectedPropertyId}
                onChange={(e) => {
                  setSelectedPropertyId(e.target.value);
                  setStartDate('');
                  setEndDate('');
                  setHighlightedBlockId(null);
                }}
                className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.areaName ? `${p.areaName}, ` : ''}
                    {p.town})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor={unitSelectId} className="block text-label font-semibold text-earth">
                Room / Unit
              </label>
              <select
                id={unitSelectId}
                disabled={loadingUnits || units.length === 0}
                value={selectedUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  setStartDate('');
                  setEndDate('');
                  setHighlightedBlockId(null);
                }}
                className="mt-1.5 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3.5 py-2 text-body-2 text-earth disabled:opacity-60"
              >
                {units.length === 0 ? (
                  <option value="">No units on this property yet</option>
                ) : (
                  units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {formatGhsPesewas(u.nightlyRatePesewas)}/night
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {units.length === 0 && !loadingUnits ? (
            <EmptyState
              icon={CalendarIcon}
              title="Add a room to open this property's calendar"
              description="Each room or unit tracks its own availability calendar. Add a unit in the property editor first."
            />
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Calendar Grid */}
              <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-heading-4 font-bold text-earth">
                      {formatMonthHeading(month)}
                    </h2>
                    {selectedUnit ? (
                      <p className="text-caption text-earth/75">
                        {selectedUnit.name} · Max {selectedUnit.maxGuests} guest
                        {selectedUnit.maxGuests === 1 ? '' : 's'}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setMonth((m) => shiftMonth(m, -1))}
                      aria-label="Previous month"
                      className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border-subtle bg-canvas text-earth hover:bg-surface-hover"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonth(getCurrentGhanaMonth())}
                      className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-canvas px-3 text-caption font-semibold text-earth hover:bg-surface-hover"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setMonth((m) => shiftMonth(m, 1))}
                      aria-label="Next month"
                      className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border-subtle bg-canvas text-earth hover:bg-surface-hover"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Accessible Legend */}
                <div className="mt-4 flex flex-wrap items-center gap-4 border-b border-border-subtle pb-3 text-caption">
                  <span className="inline-flex items-center gap-1.5 text-earth">
                    <CheckCircle2 className="h-4 w-4 text-status-success-fg" aria-hidden="true" />
                    Available
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-earth">
                    <Lock className="h-4 w-4 text-terracotta-dark" aria-hidden="true" />
                    Owner Blocked
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-earth">
                    <AlertTriangle className="h-4 w-4 text-olive" aria-hidden="true" />
                    Selected to Block
                  </span>
                </div>

                {loadingCalendar ? (
                  <div className="mt-4">
                    <SkeletonCard />
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="grid grid-cols-7 gap-1.5 text-center">
                      {WEEKDAY_HEADERS.map((wd) => (
                        <div
                          key={wd}
                          className="py-1 text-micro font-bold uppercase tracking-wide text-earth/70"
                        >
                          {wd}
                        </div>
                      ))}

                      {gridCells.map((cell, index) => {
                        if (!cell) {
                          return <div key={`blank-${index}`} aria-hidden="true" />;
                        }
                        const dayNumber = Number(cell.date.slice(8, 10));
                        const isBlocked = cell.state === 'OWNER_BLOCKED';
                        const isSelected = !isBlocked && isDateInSelection(cell.date, startDate, endDate);
                        const isHighlighted = Boolean(
                          cell.blockId && cell.blockId === highlightedBlockId,
                        );

                        let tileStyle =
                          'border-border-subtle bg-canvas text-earth hover:bg-surface-hover';
                        if (isBlocked) {
                          tileStyle = isHighlighted
                            ? 'border-terracotta-dark bg-status-warning-bg text-status-warning-fg ring-2 ring-terracotta-dark'
                            : 'border-status-warning-border bg-status-warning-bg text-status-warning-fg hover:bg-sand/40';
                        } else if (isSelected) {
                          tileStyle = 'border-olive bg-olive text-on-brand';
                        }

                        return (
                          <button
                            key={cell.date}
                            type="button"
                            onClick={() => handleDayClick(cell.date, cell.state, cell.blockId)}
                            aria-label={`${cell.date} ${isBlocked ? 'Owner Blocked' : 'Available'}`}
                            className={`flex min-h-touch flex-col items-center justify-center rounded-xl border p-1.5 text-center transition-colors ${tileStyle}`}
                          >
                            <span className="text-body-2 font-bold leading-none">{dayNumber}</span>
                            <span className="mt-1 inline-flex items-center gap-0.5 text-nano font-semibold">
                              {isBlocked ? (
                                <>
                                  <Lock className="h-2.5 w-2.5" aria-hidden="true" />
                                  <span>Blocked</span>
                                </>
                              ) : isSelected ? (
                                <span>Picked</span>
                              ) : (
                                <span>Open</span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>

              {/* Right Column: Block Form + Active Blocks */}
              <aside className="space-y-6">
                {canWrite ? (
                  <form
                    onSubmit={(e) => void handleCreateBlock(e)}
                    className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm"
                  >
                    <h2 className="font-display text-heading-4 font-bold text-earth">
                      Block Unavailable Dates
                    </h2>
                    <p className="mt-1 text-caption text-earth/75">
                      Pick dates on the calendar or enter a range below. End date is the morning the room becomes available again.
                    </p>

                    <div className="mt-4 space-y-3">
                      <div>
                        <label
                          htmlFor={startDateId}
                          className="block text-caption font-semibold text-earth"
                        >
                          First blocked night *
                        </label>
                        <input
                          id={startDateId}
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={endDateId}
                          className="block text-caption font-semibold text-earth"
                        >
                          Available again on (check-out) *
                        </label>
                        <input
                          id={endDateId}
                          type="date"
                          required
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor={reasonId}
                          className="block text-caption font-semibold text-earth"
                        >
                          Block reason
                        </label>
                        <select
                          id={reasonId}
                          value="OWNER_BLOCK"
                          disabled
                          className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-muted px-3 py-2 text-body-2 text-earth"
                        >
                          <option value="OWNER_BLOCK">Owner / Maintenance Block</option>
                        </select>
                      </div>
                    </div>

                    {formError ? (
                      <div className="mt-3">
                        <InlineError id={formErrorId} message={formError} />
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={savingBlock || !selectedUnitId}
                      className="mt-4 inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-xl bg-olive px-4 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      {savingBlock ? 'Blocking dates…' : 'Block Selected Dates'}
                    </button>
                  </form>
                ) : null}

                <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
                  <h2 className="font-display text-heading-5 font-bold text-earth">
                    Active Blocks in {formatMonthHeading(month)}
                  </h2>

                  {!calendar || calendar.blocks.length === 0 ? (
                    <p className="mt-3 text-caption text-earth/75">
                      All dates in this month are currently open for this unit.
                    </p>
                  ) : (
                    <ul className="mt-3 space-y-2.5">
                      {calendar.blocks.map((block) => {
                        const isHighlighted = block.id === highlightedBlockId;
                        return (
                          <li
                            key={block.id}
                            className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${
                              isHighlighted
                                ? 'border-terracotta-dark bg-status-warning-bg'
                                : 'border-border-subtle bg-canvas'
                            }`}
                          >
                            <div>
                              <p className="text-body-2 font-bold text-earth">
                                {block.startDate} → {block.endDate}
                              </p>
                              <p className="text-micro text-earth/70">Owner Block</p>
                            </div>

                            {canWrite ? (
                              <button
                                type="button"
                                disabled={deletingBlockId === block.id}
                                onClick={() => void handleDeleteBlock(block)}
                                aria-label={`Unblock ${block.startDate} to ${block.endDate}`}
                                className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-border-subtle bg-surface-card px-3 py-1.5 text-caption font-semibold text-status-error-fg hover:bg-surface-hover disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                Unblock
                              </button>
                            ) : null}
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              </aside>
            </div>
          )}
        </>
      )}
    </div>
  );
};
