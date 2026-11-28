import React, { useCallback, useEffect, useId, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSearch,
  Filter,
  Lock,
  RefreshCw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { EmptyState, InlineError, SkeletonCard } from '../../components/ui';
import { useAuth } from '../identity';
import { fetchAdminAuditLogs } from './api';
import {
  AUDIT_ENTITY_TYPES,
  COMMON_AUDIT_ACTIONS,
  extractAuditReason,
  formatAuditGhanaTime,
  getAuditActionMeta,
} from './format';
import type { AuditFilterParams, AuditLogPageResponse } from './types';

const PAGE_SIZE = 20;

/**
 * Admin Permanent Activity Log Viewer (`SCR-21C`, `S1-08-T5`).
 * Read-only paginated table/cards displaying immutable `audit.audit_log` entries in Ghana time.
 */
export const AdminAuditLogPage: React.FC = () => {
  const { session } = useAuth();

  const actionId = useId();
  const entityTypeId = useId();
  const actorIdField = useId();
  const fromDateId = useId();
  const toDateId = useId();
  const errorId = useId();

  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [actorIdFilter, setActorIdFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [offset, setOffset] = useState(0);

  const [appliedFilters, setAppliedFilters] = useState<AuditFilterParams>({
    limit: PAGE_SIZE,
    offset: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<AuditLogPageResponse | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminAuditLogs(token, {
        ...appliedFilters,
        limit: PAGE_SIZE,
        offset,
      });
      setPage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load activity log.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, appliedFilters, offset]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    setAppliedFilters({
      action: actionFilter.trim() || undefined,
      entityType: entityTypeFilter || undefined,
      actorId: actorIdFilter.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      limit: PAGE_SIZE,
      offset: 0,
    });
  };

  const handleResetFilters = () => {
    setActionFilter('');
    setEntityTypeFilter('');
    setActorIdFilter('');
    setFromDate('');
    setToDate('');
    setOffset(0);
    setAppliedFilters({ limit: PAGE_SIZE, offset: 0 });
  };

  const total = page?.total ?? 0;
  const items = page?.items ?? [];
  const hasPrev = offset > 0;
  const hasNext = offset + items.length < total;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-heading-2 font-bold text-earth">
            Permanent Activity Log
          </h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Immutable platform audit trail of verification decisions, listing approvals, account suspensions, and settings changes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadLogs()}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover"
        >
          <RefreshCw className="h-4 w-4 text-olive" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Immutability Notice */}
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-status-info-border bg-status-info-bg p-4"
      >
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-status-info-fg" aria-hidden="true" />
        <div>
          <p className="text-body-2 font-semibold text-status-info-fg">
            Append-only audit protection active
          </p>
          <p className="mt-0.5 text-caption text-earth/80">
            Audit records cannot be edited or deleted by any application user or database role. All timestamps are stored in UTC and displayed in Ghana time (Africa/Accra).
          </p>
        </div>
      </div>

      {/* Filter Form */}
      <form
        onSubmit={handleApplyFilters}
        className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm"
      >
        <div className="mb-3 flex items-center gap-2">
          <Filter className="h-4 w-4 text-olive" aria-hidden="true" />
          <h2 className="font-display text-heading-5 font-bold text-earth">Filter Activity</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label htmlFor={actionId} className="block text-caption font-semibold text-earth">
              Action
            </label>
            <input
              id={actionId}
              list="findstay-audit-actions"
              type="text"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              placeholder="e.g. listing.approved"
              className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
            />
            <datalist id="findstay-audit-actions">
              {COMMON_AUDIT_ACTIONS.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>

          <div>
            <label htmlFor={entityTypeId} className="block text-caption font-semibold text-earth">
              Entity Type
            </label>
            <select
              id={entityTypeId}
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
            >
              <option value="">All entities</option>
              {AUDIT_ENTITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor={actorIdField} className="block text-caption font-semibold text-earth">
              Actor User ID
            </label>
            <input
              id={actorIdField}
              type="text"
              value={actorIdFilter}
              onChange={(e) => setActorIdFilter(e.target.value)}
              placeholder="UUID"
              className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
            />
          </div>

          <div>
            <label htmlFor={fromDateId} className="block text-caption font-semibold text-earth">
              From (Ghana date)
            </label>
            <input
              id={fromDateId}
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
            />
          </div>

          <div>
            <label htmlFor={toDateId} className="block text-caption font-semibold text-earth">
              To (Ghana date)
            </label>
            <input
              id={toDateId}
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
          >
            Clear
          </button>
          <button
            type="submit"
            className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-olive px-5 py-2 text-body-2 font-semibold text-on-brand hover:bg-olive-hover"
          >
            <FileSearch className="h-4 w-4" aria-hidden="true" />
            Apply Filters
          </button>
        </div>
      </form>

      {error ? <InlineError id={errorId} message={error} /> : null}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No matching activity log entries"
          description="Try widening your date range or clearing filters to view all recorded platform events."
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-caption text-earth/75">
            <span>
              Showing <strong className="font-semibold text-earth">{offset + 1}</strong>–
              <strong className="font-semibold text-earth">{offset + items.length}</strong> of{' '}
              <strong className="font-semibold text-earth">{total}</strong> permanent entries
            </span>
          </div>

          <ul className="space-y-3">
            {items.map((entry) => {
              const meta = getAuditActionMeta(entry.action);
              const reason = extractAuditReason(entry.metadata);
              const isExpanded = expandedId === entry.id;
              return (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-sm"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-3 py-0.5 text-micro font-bold ${meta.toneClass}`}
                        >
                          {meta.label}
                        </span>
                        <code className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-micro text-earth/85">
                          {entry.action}
                        </code>
                        <span className="text-caption font-semibold text-earth">
                          {entry.entityType}
                        </span>
                        <code className="font-mono text-micro text-earth/70">
                          {entry.entityId}
                        </code>
                      </div>

                      {reason ? (
                        <p className="text-body-2 text-earth">
                          <span className="font-semibold">Reason: </span>
                          {reason}
                        </p>
                      ) : null}

                      <div className="flex flex-wrap items-center gap-4 text-caption text-earth/75">
                        <span className="inline-flex items-center gap-1">
                          <User className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
                          <span className="font-medium text-earth">
                            {entry.actorName ?? 'System / User'}
                          </span>
                          <span className="font-mono text-micro text-earth/60">
                            ({entry.actorId.slice(0, 8)}…)
                          </span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-olive" aria-hidden="true" />
                          {formatAuditGhanaTime(entry.createdAt)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                      className="inline-flex min-h-touch shrink-0 items-center justify-center rounded-xl border border-border-subtle bg-canvas px-3 py-1.5 text-caption font-semibold text-earth hover:bg-surface-hover"
                    >
                      {isExpanded ? 'Hide Details' : 'View Metadata'}
                    </button>
                  </div>

                  {isExpanded ? (
                    <pre className="mt-3 overflow-x-auto rounded-xl border border-border-subtle bg-surface-muted p-3 font-mono text-micro text-earth">
                      {JSON.stringify(
                        {
                          id: entry.id,
                          actorId: entry.actorId,
                          orgId: entry.orgId,
                          entityType: entry.entityType,
                          entityId: entry.entityId,
                          createdAtUtc: entry.createdAt,
                          metadata: entry.metadata,
                        },
                        null,
                        2,
                      )}
                    </pre>
                  ) : null}
                </li>
              );
            })}
          </ul>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <button
              type="button"
              disabled={!hasPrev}
              onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
              className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </button>
            <button
              type="button"
              disabled={!hasNext}
              onClick={() => setOffset((o) => o + PAGE_SIZE)}
              className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
