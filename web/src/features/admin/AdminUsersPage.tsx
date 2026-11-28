import React, { useCallback, useEffect, useId, useState } from 'react';
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ShieldBan,
  UserPlus,
  Users,
} from 'lucide-react';
import { EmptyState, InlineError, SkeletonCard, useToast } from '../../components/ui';
import { formatAuditGhanaTime } from '../audit';
import { useAuth } from '../identity';
import {
  createAdminUser,
  fetchAdminUsers,
  restoreAdminUser,
  suspendAdminUser,
} from './api';
import type { AdminUserItem, AdminUserPageResponse } from './types';
import { validateSuspensionReason } from './validation';

const PAGE_SIZE = 20;

/**
 * Admin User Management (`SCR-21A`, `S1-16-T5`):
 * Searchable user list, Create User panel, Suspend User confirmation with mandatory >= 10 char
 * reason + immediate access revocation, Restore User confirmation, and self-protection guard.
 */
export const AdminUsersPage: React.FC = () => {
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();

  const searchId = useId();
  const newEmailId = useId();
  const newNameId = useId();
  const newPhoneId = useId();
  const newRoleId = useId();
  const suspendReasonId = useId();
  const restoreNoteId = useId();
  const listErrorId = useId();
  const modalErrorId = useId();

  const [searchInput, setSearchInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [page, setPage] = useState<AdminUserPageResponse | null>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'GUEST' | 'OWNER' | 'ADMIN'>('GUEST');

  const [suspendTarget, setSuspendTarget] = useState<AdminUserItem | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const [restoreTarget, setRestoreTarget] = useState<AdminUserItem | null>(null);
  const [restoreNote, setRestoreNote] = useState('');

  const [modalError, setModalError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const canManage = hasPermission('admin.user.manage');
  const currentUserId = session?.user.id ?? null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOffset(0);
      setDebouncedQuery(searchInput);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const loadUsers = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setLoading(true);
    setListError(null);
    try {
      const data = await fetchAdminUsers(token, {
        q: debouncedQuery,
        status: statusFilter,
        limit: PAGE_SIZE,
        offset,
      });
      setPage(data);
    } catch (err) {
      setListError(err instanceof Error ? err.message : 'Unable to load users.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token, debouncedQuery, statusFilter, offset]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token || !canManage) return;
    setBusy(true);
    setModalError(null);
    try {
      const created = await createAdminUser(token, {
        email: newEmail.trim(),
        displayName: newName.trim(),
        phone: newPhone.trim() || undefined,
        role: newRole,
      });
      showToast({
        variant: 'success',
        title: 'User account created',
        message: `User account created for ${created.email}.`,
      });
      setNewEmail('');
      setNewName('');
      setNewPhone('');
      setNewRole('GUEST');
      setShowCreateForm(false);
      await loadUsers();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unable to create user.');
    } finally {
      setBusy(false);
    }
  };

  const handleSuspendUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token || !suspendTarget || !canManage) return;

    const validationErr = validateSuspensionReason(suspendReason);
    if (validationErr) {
      setModalError(validationErr);
      return;
    }

    setBusy(true);
    setModalError(null);
    try {
      const updated = await suspendAdminUser(token, suspendTarget.id, suspendReason.trim());
      showToast({
        variant: 'success',
        title: 'Account suspended',
        message: `Account suspended for ${updated.email}. Active sessions are blocked immediately.`,
      });
      setSuspendTarget(null);
      setSuspendReason('');
      await loadUsers();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unable to suspend user.');
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    if (!token || !restoreTarget || !canManage) return;
    setBusy(true);
    setModalError(null);
    try {
      const updated = await restoreAdminUser(token, restoreTarget.id, restoreNote);
      showToast({
        variant: 'success',
        title: 'Account restored',
        message: `Account restored for ${updated.email}.`,
      });
      setRestoreTarget(null);
      setRestoreNote('');
      await loadUsers();
    } catch (err) {
      setModalError(err instanceof Error ? err.message : 'Unable to restore user.');
    } finally {
      setBusy(false);
    }
  };

  const items = page?.items ?? [];
  const total = page?.total ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-heading-2 font-bold text-earth">User Management</h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Search platform accounts, provision new users, and suspend or restore access with full audit trails.
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={() => {
              setModalError(null);
              setShowCreateForm((prev) => !prev);
            }}
            className="inline-flex min-h-touch items-center justify-center gap-2 rounded-xl bg-olive px-5 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            {showCreateForm ? 'Close Create Form' : 'Create User'}
          </button>
        ) : null}
      </div>

      {/* Create User Form */}
      {showCreateForm && canManage ? (
        <form
          onSubmit={(e) => void handleCreateUser(e)}
          className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm"
        >
          <h2 className="font-display text-heading-4 font-bold text-earth">
            Provision New User Account
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={newEmailId} className="block text-caption font-semibold text-earth">
                Email Address *
              </label>
              <input
                id={newEmailId}
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="name@example.com"
                className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
              />
            </div>

            <div>
              <label htmlFor={newNameId} className="block text-caption font-semibold text-earth">
                Full Name *
              </label>
              <input
                id={newNameId}
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Kofi Mensah"
                className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
              />
            </div>

            <div>
              <label htmlFor={newPhoneId} className="block text-caption font-semibold text-earth">
                Phone Number (optional)
              </label>
              <input
                id={newPhoneId}
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="+233244000000"
                className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
              />
            </div>

            <div>
              <label htmlFor={newRoleId} className="block text-caption font-semibold text-earth">
                Role *
              </label>
              <select
                id={newRoleId}
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'GUEST' | 'OWNER' | 'ADMIN')}
                className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-canvas px-3 py-2 text-body-2 text-earth"
              >
                <option value="GUEST">Guest</option>
                <option value="OWNER">Property Owner</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
          </div>

          {modalError ? (
            <div className="mt-3">
              <InlineError id={modalErrorId} message={modalError} />
            </div>
          ) : null}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-canvas px-4 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-touch items-center rounded-xl bg-olive px-5 py-2 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
            >
              {busy ? 'Creating…' : 'Create Account'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Suspend User Confirmation Panel */}
      {suspendTarget ? (
        <form
          onSubmit={(e) => void handleSuspendUser(e)}
          className="rounded-2xl border border-status-warning-border bg-status-warning-bg p-5 shadow-sm"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className="mt-0.5 h-5 w-5 shrink-0 text-status-warning-fg"
              aria-hidden="true"
            />
            <div className="flex-1 space-y-3">
              <div>
                <h2 className="font-display text-heading-4 font-bold text-status-warning-fg">
                  Suspend {suspendTarget.displayName} ({suspendTarget.email})
                </h2>
                <p className="mt-1 text-caption text-earth/85">
                  Suspending this account immediately blocks active sessions and future sign-ins, notifies the user, and records a permanent entry in the activity log.
                </p>
              </div>

              <div>
                <label
                  htmlFor={suspendReasonId}
                  className="block text-caption font-semibold text-earth"
                >
                  Reason for Suspension (minimum 10 characters) *
                </label>
                <textarea
                  id={suspendReasonId}
                  rows={2}
                  required
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="e.g. Repeated policy violation or fraudulent verification documents"
                  className="mt-1 w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
                />
              </div>

              {modalError ? <InlineError id={modalErrorId} message={modalError} /> : null}

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSuspendTarget(null);
                    setSuspendReason('');
                    setModalError(null);
                  }}
                  className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-terracotta-dark px-5 py-2 text-body-2 font-semibold text-on-brand hover:bg-terracotta disabled:opacity-50"
                >
                  <ShieldBan className="h-4 w-4" aria-hidden="true" />
                  {busy ? 'Suspending…' : 'Confirm Suspension'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : null}

      {/* Restore User Confirmation Panel */}
      {restoreTarget ? (
        <form
          onSubmit={(e) => void handleRestoreUser(e)}
          className="rounded-2xl border border-olive bg-ivory p-5 shadow-sm"
        >
          <h2 className="font-display text-heading-4 font-bold text-earth">
            Restore {restoreTarget.displayName} ({restoreTarget.email})
          </h2>
          <p className="mt-1 text-caption text-earth/80">
            They will regain access immediately and the restoration will be recorded in the permanent activity log.
          </p>
          <div className="mt-3">
            <label htmlFor={restoreNoteId} className="block text-caption font-semibold text-earth">
              Restoration Note (optional)
            </label>
            <input
              id={restoreNoteId}
              type="text"
              value={restoreNote}
              onChange={(e) => setRestoreNote(e.target.value)}
              placeholder="e.g. Verification documents clarified"
              className="mt-1 min-h-touch w-full rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth"
            />
          </div>
          {modalError ? (
            <div className="mt-3">
              <InlineError id={modalErrorId} message={modalError} />
            </div>
          ) : null}
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setRestoreTarget(null);
                setRestoreNote('');
                setModalError(null);
              }}
              className="inline-flex min-h-touch items-center rounded-xl border border-border-subtle bg-surface-card px-4 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-touch items-center gap-2 rounded-xl bg-olive px-5 py-2 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {busy ? 'Restoring…' : 'Restore Account'}
            </button>
          </div>
        </form>
      ) : null}

      {/* Search & Status Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-earth/60"
            aria-hidden="true"
          />
          <label htmlFor={searchId} className="sr-only">
            Search users by name or email
          </label>
          <input
            id={searchId}
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name or email…"
            className="min-h-touch w-full rounded-xl border border-border-subtle bg-canvas pl-10 pr-3.5 py-2 text-body-2 text-earth"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter users by status">
          {(['ALL', 'ACTIVE', 'SUSPENDED'] as const).map((status) => {
            const active = statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => {
                  setOffset(0);
                  setStatusFilter(status);
                }}
                className={`min-h-touch rounded-full border px-4 py-1.5 text-caption font-semibold transition-colors ${
                  active
                    ? 'border-olive bg-olive text-on-brand'
                    : 'border-border-subtle bg-canvas text-earth hover:bg-surface-hover'
                }`}
              >
                {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Suspended'}
              </button>
            );
          })}
        </div>
      </div>

      {listError ? <InlineError id={listErrorId} message={listError} /> : null}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No matching users found"
          description="Try a different name, email, or status filter."
        />
      ) : (
        <div className="space-y-4">
          <ul className="space-y-3">
            {items.map((user) => {
              const isSelf = currentUserId === user.id;
              const isSuspended = user.status === 'SUSPENDED';
              return (
                <li
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-heading-5 font-bold text-earth">
                        {user.displayName}
                      </p>
                      <span className="rounded-full border border-border-subtle bg-surface-muted px-2.5 py-0.5 text-micro font-bold text-earth">
                        {user.roleCode}
                      </span>
                      <span
                        className={`rounded-full border px-2.5 py-0.5 text-micro font-bold ${
                          isSuspended
                            ? 'border-status-error-border bg-status-error-bg text-status-error-fg'
                            : 'border-status-success-border bg-status-success-bg text-status-success-fg'
                        }`}
                      >
                        {isSuspended ? 'Suspended' : 'Active'}
                      </span>
                    </div>
                    <p className="text-caption text-earth/80">
                      {user.email}
                      {user.phone ? ` · ${user.phone}` : ''}
                    </p>
                    <p className="text-micro text-earth/65">
                      Joined {formatAuditGhanaTime(user.createdAt)}
                      {isSuspended && user.suspensionReason
                        ? ` · Reason: ${user.suspensionReason}`
                        : ''}
                    </p>
                  </div>

                  {canManage ? (
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      {isSuspended ? (
                        <button
                          type="button"
                          onClick={() => {
                            setSuspendTarget(null);
                            setRestoreTarget(user);
                            setModalError(null);
                          }}
                          className="inline-flex min-h-touch items-center gap-1.5 rounded-xl bg-olive px-4 py-2 text-caption font-semibold text-on-brand hover:bg-olive-hover"
                        >
                          <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          Restore User
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isSelf}
                          title={isSelf ? 'You cannot suspend your own admin account' : undefined}
                          onClick={() => {
                            setRestoreTarget(null);
                            setSuspendTarget(user);
                            setModalError(null);
                          }}
                          className="inline-flex min-h-touch items-center gap-1.5 rounded-xl border border-status-error-border bg-status-error-bg px-4 py-2 text-caption font-semibold text-status-error-fg hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShieldBan className="h-4 w-4" aria-hidden="true" />
                          Suspend User
                        </button>
                      )}
                      {isSelf ? (
                        <span className="text-micro text-earth/65">
                          You cannot suspend your own admin account
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-caption text-earth/75">
              Showing {offset + 1}–{offset + items.length} of {total}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0}
                onClick={() => setOffset((o) => Math.max(0, o - PAGE_SIZE))}
                className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-border-subtle bg-surface-card px-3.5 py-2 text-caption font-semibold text-earth hover:bg-surface-hover disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                Previous
              </button>
              <button
                type="button"
                disabled={offset + items.length >= total}
                onClick={() => setOffset((o) => o + PAGE_SIZE)}
                className="inline-flex min-h-touch items-center gap-1 rounded-xl border border-border-subtle bg-surface-card px-3.5 py-2 text-caption font-semibold text-earth hover:bg-surface-hover disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
