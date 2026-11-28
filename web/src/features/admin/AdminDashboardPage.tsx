import React, { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Clock,
  FileSearch,
  RefreshCw,
  Settings,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { InlineError, SkeletonCard } from '../../components/ui';
import { formatAuditGhanaTime, getAuditActionMeta } from '../audit';
import { useAuth } from '../identity';
import { fetchAdminDashboard } from './api';
import type { AdminDashboardResponse } from './types';

/**
 * Admin Dashboard (`SCR-18`, `S1-16-T5`):
 * Displays live KPI cards for pending verifications, pending listings, published listings,
 * and platform users (active vs suspended), quick navigation shortcuts, and recent audit activity.
 */
export const AdminDashboardPage: React.FC = () => {
  const { session } = useAuth();
  const errorId = useId();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AdminDashboardResponse | null>(null);

  const loadSummary = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminDashboard(token);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-heading-2 font-bold text-earth">
            Platform Administration
          </h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Live queue status, published Takoradi listings, user account health, and recent audit events.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadSummary()}
          className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-body-2 font-semibold text-earth hover:bg-surface-hover"
        >
          <RefreshCw className="h-4 w-4 text-olive" aria-hidden="true" />
          Refresh Metrics
        </button>
      </div>

      {error ? <InlineError id={errorId} message={error} /> : null}

      {loading || !summary ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* KPI 1: Pending Verifications */}
            <article className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-olive">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-micro font-bold ${
                    summary.pendingVerificationsCount > 0
                      ? 'border-status-warning-border bg-status-warning-bg text-status-warning-fg'
                      : 'border-status-success-border bg-status-success-bg text-status-success-fg'
                  }`}
                >
                  {summary.pendingVerificationsCount > 0 ? 'Needs Review' : 'Clear'}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-caption font-semibold text-earth/75">Pending Verifications</p>
                <p className="mt-1 font-display text-heading-2 font-bold text-earth">
                  {summary.pendingVerificationsCount}
                </p>
              </div>
              <Link
                to="/admin/reviews"
                className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-olive hover:underline"
              >
                Open Queue
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>

            {/* KPI 2: Pending Listings */}
            <article className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-olive">
                  <ClipboardCheck className="h-5 w-5" aria-hidden="true" />
                </div>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-micro font-bold ${
                    summary.pendingListingsCount > 0
                      ? 'border-status-warning-border bg-status-warning-bg text-status-warning-fg'
                      : 'border-status-success-border bg-status-success-bg text-status-success-fg'
                  }`}
                >
                  {summary.pendingListingsCount > 0 ? 'Needs Review' : 'Clear'}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-caption font-semibold text-earth/75">Pending Listings</p>
                <p className="mt-1 font-display text-heading-2 font-bold text-earth">
                  {summary.pendingListingsCount}
                </p>
              </div>
              <Link
                to="/admin/reviews"
                className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-olive hover:underline"
              >
                Review Listings
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>

            {/* KPI 3: Active Published Listings */}
            <article className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-olive">
                  <Building2 className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-status-success-border bg-status-success-bg px-2.5 py-0.5 text-micro font-bold text-status-success-fg">
                  Live
                </span>
              </div>
              <div className="mt-4">
                <p className="text-caption font-semibold text-earth/75">Published Listings</p>
                <p className="mt-1 font-display text-heading-2 font-bold text-earth">
                  {summary.publishedListingsCount}
                </p>
                <p className="mt-0.5 text-micro text-earth/65">
                  {summary.suspendedListingsCount} suspended
                </p>
              </div>
              <Link
                to="/admin/reviews"
                className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-olive hover:underline"
              >
                Moderate Listings
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>

            {/* KPI 4: Platform Users */}
            <article className="flex flex-col justify-between rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-muted text-olive">
                  <Users className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className="rounded-full border border-status-info-border bg-status-info-bg px-2.5 py-0.5 text-micro font-bold text-status-info-fg">
                  {summary.suspendedUsersCount} suspended
                </span>
              </div>
              <div className="mt-4">
                <p className="text-caption font-semibold text-earth/75">Platform Users</p>
                <p className="mt-1 font-display text-heading-2 font-bold text-earth">
                  {summary.totalUsersCount}
                </p>
                <p className="mt-0.5 text-micro text-earth/65">
                  {summary.activeUsersCount} active
                </p>
              </div>
              <Link
                to="/admin/users"
                className="mt-4 inline-flex items-center gap-1 text-caption font-semibold text-olive hover:underline"
              >
                Manage Users
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </article>
          </div>

          {/* Quick Actions Bar */}
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <h2 className="font-display text-heading-5 font-bold text-earth">Quick Actions</h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                to="/admin/reviews"
                className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl bg-olive px-4 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover"
              >
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Review Submissions
              </Link>
              <Link
                to="/admin/users"
                className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-border-subtle bg-canvas px-4 py-2.5 text-body-2 font-semibold text-earth hover:bg-surface-hover"
              >
                <Users className="h-4 w-4 text-olive" aria-hidden="true" />
                Manage Users
              </Link>
              <Link
                to="/admin/settings"
                className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-border-subtle bg-canvas px-4 py-2.5 text-body-2 font-semibold text-earth hover:bg-surface-hover"
              >
                <Settings className="h-4 w-4 text-olive" aria-hidden="true" />
                Platform Settings
              </Link>
              <Link
                to="/admin/audit"
                className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl border border-border-subtle bg-canvas px-4 py-2.5 text-body-2 font-semibold text-earth hover:bg-surface-hover"
              >
                <FileSearch className="h-4 w-4 text-olive" aria-hidden="true" />
                Permanent Audit Log
              </Link>
            </div>
          </section>

          {/* Recent Activity Feed */}
          <section className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-heading-4 font-bold text-earth">
                Recent Audited Activity
              </h2>
              <Link
                to="/admin/audit"
                className="text-caption font-semibold text-olive hover:underline"
              >
                View Full Log
              </Link>
            </div>

            {summary.recentActivity.length === 0 ? (
              <p className="mt-3 text-caption text-earth/75">
                No administrative actions have been recorded yet.
              </p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {summary.recentActivity.map((entry) => {
                  const meta = getAuditActionMeta(entry.action);
                  return (
                    <li
                      key={entry.id}
                      className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-canvas p-3.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-micro font-bold ${meta.toneClass}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-body-2 font-semibold text-earth">
                          {entry.actorName ?? 'Administrator'}
                        </span>
                        <span className="text-caption text-earth/75">
                          · {entry.entityType} ({entry.entityId.slice(0, 12)})
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-micro text-earth/65">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        {formatAuditGhanaTime(entry.createdAt)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};
