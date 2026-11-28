import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Check,
  Copy,
  MailPlus,
  RefreshCw,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatusBadge, type StatusBadgeVariant } from '../../components/StatusBadge';
import {
  EmptyState,
  FormField,
  InlineError,
  SkeletonCard,
  SkeletonList,
  useToast,
} from '../../components/ui';
import { ApiClientError } from '../../lib/api';
import { PermissionGate, useAuth } from '../identity';
import {
  createStaffInvitation,
  fetchOwnerInvitations,
  fetchOwnerMembers,
  fetchOwnerOrganization,
  formatAccraDateTime,
  parsePropertyIdList,
  revokeStaffInvitation,
  updateOwnerOrganization,
  updateStaffPermissions,
} from './api';
import type {
  CreatedStaffInvitation,
  InvitationStatus,
  OrganizationProfile,
  StaffInvitation,
  StaffMember,
  VerificationStatus,
} from './types';

const GHANA_E164 = /^\+233\d{9}$/;

function verificationBadge(status: VerificationStatus): {
  variant: StatusBadgeVariant;
  label: string;
} {
  switch (status) {
    case 'APPROVED':
      return { variant: 'success', label: 'Verified Owner' };
    case 'PENDING':
      return { variant: 'warning', label: 'Pending Review' };
    case 'PARTIALLY_REJECTED':
      return { variant: 'error', label: 'Action Required' };
    case 'REJECTED':
      return { variant: 'error', label: 'Rejected' };
    default:
      return { variant: 'info', label: 'Not Submitted' };
  }
}

function invitationBadge(status: InvitationStatus): {
  variant: StatusBadgeVariant;
  label: string;
} {
  switch (status) {
    case 'PENDING':
      return { variant: 'warning', label: 'Pending Acceptance' };
    case 'ACCEPTED':
      return { variant: 'success', label: 'Accepted' };
    case 'EXPIRED':
      return { variant: 'error', label: 'Expired' };
    case 'REVOKED':
      return { variant: 'info', label: 'Revoked' };
  }
}

function shortId(uuid: string): string {
  return `${uuid.slice(0, 8)}…`;
}

/**
 * SCR-08: Company & Staff Management (`/owner/org`) — S1-07-T6.
 * Implements Company Profile editing, Staff Invitations (with one-time shareable
 * acceptance link), Active Team Members, and per-property permission grant/revoke.
 */
export const OwnerOrganizationPage: React.FC = () => {
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();
  const token = session?.access_token ?? '';
  const canEditOrg = hasPermission('org.write');
  const canManageStaff = hasPermission('org.staff.manage');

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [org, setOrg] = useState<OrganizationProfile | null>(null);
  const [members, setMembers] = useState<StaffMember[]>([]);
  const [invitations, setInvitations] = useState<StaffInvitation[]>([]);

  // Company profile form
  const [name, setName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [orgFormError, setOrgFormError] = useState<string | null>(null);
  const [savingOrg, setSavingOrg] = useState(false);

  // Invite staff form
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePropsInput, setInvitePropsInput] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [latestCreatedInvite, setLatestCreatedInvite] =
    useState<CreatedStaffInvitation | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Per-member permission editor
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberPropsInput, setMemberPropsInput] = useState('');
  const [memberEditError, setMemberEditError] = useState<string | null>(null);
  const [savingMember, setSavingMember] = useState(false);
  const [revokingInviteId, setRevokingInviteId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setLoadError(null);
    try {
      const [orgData, memberList, inviteList] = await Promise.all([
        fetchOwnerOrganization(token),
        fetchOwnerMembers(token),
        canManageStaff ? fetchOwnerInvitations(token) : Promise.resolve([]),
      ]);
      setOrg(orgData);
      setName(orgData.name);
      setDisplayName(orgData.displayName);
      setContactEmail(orgData.contactEmail);
      setContactPhone(orgData.contactPhone ?? '');
      setMembers(memberList);
      setInvitations(inviteList);
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to load your organisation details right now.';
      setLoadError(msg);
    } finally {
      setLoading(false);
    }
  }, [token, canManageStaff]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canEditOrg) return;
    setOrgFormError(null);

    if (!name.trim()) {
      setOrgFormError('Enter your company or business name.');
      return;
    }
    if (!displayName.trim()) {
      setOrgFormError('Enter a public display name for guest listings.');
      return;
    }
    if (!contactEmail.trim() || !contactEmail.includes('@')) {
      setOrgFormError('Enter a valid business contact email.');
      return;
    }
    if (contactPhone.trim() && !GHANA_E164.test(contactPhone.trim())) {
      setOrgFormError('Contact phone must use Ghana E.164 format (+233XXXXXXXXX).');
      return;
    }

    setSavingOrg(true);
    try {
      const updated = await updateOwnerOrganization(token, {
        name: name.trim(),
        displayName: displayName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
      });
      setOrg(updated);
      showToast({
        variant: 'success',
        title: 'Company profile updated',
        message: 'Your organisation details have been saved.',
      });
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Could not update company profile.';
      setOrgFormError(msg);
      showToast({ variant: 'error', title: 'Save failed', message: msg });
    } finally {
      setSavingOrg(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canManageStaff) return;
    setInviteError(null);

    const trimmedEmail = inviteEmail.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setInviteError('Enter a valid staff email address.');
      return;
    }

    const { ids, invalid } = parsePropertyIdList(invitePropsInput);
    if (invalid.length > 0) {
      setInviteError(`Invalid property UUID(s): ${invalid.join(', ')}`);
      return;
    }

    setSendingInvite(true);
    try {
      const created = await createStaffInvitation(token, trimmedEmail, ids);
      setLatestCreatedInvite(created);
      setCopiedLink(false);
      setInviteEmail('');
      setInvitePropsInput('');
      const refreshed = await fetchOwnerInvitations(token);
      setInvitations(refreshed);
      showToast({
        variant: 'success',
        title: `Invitation sent to ${created.email}`,
        message: `Valid until ${formatAccraDateTime(created.expiresAt)}.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiClientError
          ? err.message
          : 'Unable to send staff invitation.';
      setInviteError(msg);
      showToast({ variant: 'error', title: 'Invitation failed', message: msg });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleCopyInviteLink = async (acceptToken: string) => {
    const inviteUrl = `${window.location.origin}/owner/invitations/${acceptToken}`;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      showToast({
        variant: 'success',
        title: 'Invite link copied',
        message: 'Share this link securely with your invited staff member.',
      });
    } catch {
      showToast({
        variant: 'info',
        title: 'Copy link manually',
        message: inviteUrl,
      });
    }
  };

  const handleRevokeInvite = async (invitation: StaffInvitation) => {
    if (!token || !canManageStaff) return;
    setRevokingInviteId(invitation.id);
    try {
      await revokeStaffInvitation(token, invitation.id);
      const refreshed = await fetchOwnerInvitations(token);
      setInvitations(refreshed);
      showToast({
        variant: 'info',
        title: 'Invitation revoked',
        message: `${invitation.email} can no longer accept this link.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Unable to revoke invitation.';
      showToast({ variant: 'error', title: 'Revoke failed', message: msg });
    } finally {
      setRevokingInviteId(null);
    }
  };

  const startEditingMember = (member: StaffMember) => {
    setEditingMemberId(member.userId);
    setMemberPropsInput(member.propertyIds.join(', '));
    setMemberEditError(null);
  };

  const handleSaveMemberPermissions = async (userId: string, propertyIds: string[]) => {
    if (!token || !canManageStaff) return;
    setSavingMember(true);
    setMemberEditError(null);
    try {
      const updated = await updateStaffPermissions(token, userId, propertyIds);
      setMembers((prev) =>
        prev.map((m) => (m.userId === updated.userId ? updated : m)),
      );
      setEditingMemberId(null);
      showToast({
        variant: 'success',
        title: propertyIds.length === 0 ? 'All property access revoked' : 'Staff access updated',
        message:
          propertyIds.length === 0
            ? 'This staff member no longer has access to any properties.'
            : `Assigned ${propertyIds.length} ${propertyIds.length === 1 ? 'property' : 'properties'}.`,
      });
    } catch (err) {
      const msg =
        err instanceof ApiClientError ? err.message : 'Unable to update staff access.';
      setMemberEditError(msg);
      showToast({ variant: 'error', title: 'Update failed', message: msg });
    } finally {
      setSavingMember(false);
    }
  };

  const handleSubmitMemberEditor = (userId: string) => {
    const { ids, invalid } = parsePropertyIdList(memberPropsInput);
    if (invalid.length > 0) {
      setMemberEditError(`Invalid property UUID(s): ${invalid.join(', ')}`);
      return;
    }
    handleSaveMemberPermissions(userId, ids);
  };

  const prefillReinvite = (invitation: StaffInvitation) => {
    setInviteEmail(invitation.email);
    setInvitePropsInput(invitation.propertyIds.join(', '));
    setInviteError(null);
    showToast({
      variant: 'info',
      title: 'Re-invite pre-filled',
      message: `Review the form and send a fresh invitation to ${invitation.email}.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading organisation details">
        <SkeletonCard />
        <SkeletonList count={3} />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-4 rounded-2xl border border-status-error-border bg-surface-card p-6">
        <StatusBadge variant="error" label="Could not load organisation" />
        <p className="text-body-2 text-earth/80">{loadError}</p>
        <button
          type="button"
          onClick={loadAll}
          className="inline-flex min-h-touch items-center gap-2 rounded-lg bg-olive px-4 py-2 text-caption font-semibold text-ivory hover:bg-olive-hover"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  const vBadge = org ? verificationBadge(org.verificationStatus) : null;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-caption font-semibold uppercase tracking-wide text-olive">
            Owner / Team &amp; Org
          </p>
          <h1 className="mt-1 font-display text-heading-3 font-bold text-earth">
            Team &amp; Company Space
          </h1>
          <p className="mt-1 text-body-2 text-earth/75">
            Manage your company details, invite staff members, and control per-property access.
          </p>
        </div>
        {vBadge ? (
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge variant={vBadge.variant} label={vBadge.label} />
            {org?.verificationStatus === 'NOT_SUBMITTED' ? (
              <Link
                to="/owner/verification"
                className="inline-flex min-h-touch items-center rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
              >
                Start verification
              </Link>
            ) : null}
          </div>
        ) : null}
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Section 1: Company Profile Card */}
        <section
          aria-labelledby="company-profile-heading"
          className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6 lg:col-span-6"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-olive" aria-hidden="true" />
            <h2
              id="company-profile-heading"
              className="font-display text-subtitle font-bold text-earth"
            >
              Company Profile
            </h2>
          </div>

          <form onSubmit={handleSaveOrg} className="mt-4 space-y-4">
            <FormField
              id="org-legal-name"
              label="Company Legal Name"
              required
              disabled={!canEditOrg || savingOrg}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Takoradi Harbour Hospitality Ltd"
            />
            <FormField
              id="org-display-name"
              label="Public Display Name"
              required
              disabled={!canEditOrg || savingOrg}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              hint="Shown on your published guest listings."
              placeholder="e.g. Harbour View Lodges"
            />
            <FormField
              id="org-contact-email"
              label="Business Contact Email"
              type="email"
              required
              disabled={!canEditOrg || savingOrg}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="bookings@company.gh"
            />
            <FormField
              id="org-contact-phone"
              label="Business Contact Phone"
              type="tel"
              disabled={!canEditOrg || savingOrg}
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              hint="Optional Ghana E.164 format (+233XXXXXXXXX)."
              placeholder="+233241234567"
            />

            {orgFormError ? (
              <InlineError id="org-profile-error" message={orgFormError} />
            ) : null}

            <PermissionGate requiredPermissions={['org.write']}>
              <button
                type="submit"
                disabled={savingOrg}
                className="inline-flex min-h-touch w-full items-center justify-center rounded-lg bg-olive px-5 py-2.5 text-caption font-semibold text-ivory transition-colors hover:bg-olive-hover disabled:opacity-60 sm:w-auto"
              >
                {savingOrg ? 'Saving…' : 'Save Changes'}
              </button>
            </PermissionGate>
          </form>
        </section>

        {/* Section 2: Invite Staff Form */}
        <PermissionGate requiredPermissions={['org.staff.manage']}>
          <section
            aria-labelledby="invite-staff-heading"
            className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6 lg:col-span-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-olive" aria-hidden="true" />
                <h2
                  id="invite-staff-heading"
                  className="font-display text-subtitle font-bold text-earth"
                >
                  Invite Staff Member
                </h2>
              </div>
              <StatusBadge variant="info" label="Role: STAFF" />
            </div>

            <p className="mt-2 text-caption text-earth/75">
              Invited staff receive a single-use acceptance link valid for 7 days and can only
              manage the specific properties you assign.
            </p>

            <form onSubmit={handleSendInvite} className="mt-4 space-y-4">
              <FormField
                id="invite-staff-email"
                label="Staff Email Address"
                type="email"
                required
                disabled={sendingInvite}
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="manager@example.com"
              />
              <FormField
                id="invite-property-ids"
                label="Assigned Property IDs (optional)"
                disabled={sendingInvite}
                value={invitePropsInput}
                onChange={(e) => setInvitePropsInput(e.target.value)}
                hint="Comma-separated property UUIDs. Leave blank to invite now and assign properties once created in S1-13."
                placeholder="01950000-0000-7000-8000-000000000001"
              />

              {inviteError ? (
                <InlineError id="invite-staff-error" message={inviteError} />
              ) : null}

              <button
                type="submit"
                disabled={sendingInvite}
                className="inline-flex min-h-touch w-full items-center justify-center gap-2 rounded-lg bg-olive px-5 py-2.5 text-caption font-semibold text-ivory transition-colors hover:bg-olive-hover disabled:opacity-60 sm:w-auto"
              >
                <MailPlus className="h-4 w-4" aria-hidden="true" />
                <span>{sendingInvite ? 'Sending…' : 'Send Invitation'}</span>
              </button>
            </form>

            {latestCreatedInvite ? (
              <div className="mt-5 rounded-xl border border-status-success-border bg-status-success-bg p-4">
                <p className="text-caption font-semibold text-status-success-fg">
                  One-time invitation link ready for {latestCreatedInvite.email}
                </p>
                <p className="mt-1 break-all font-mono text-caption text-earth">
                  {`${window.location.origin}/owner/invitations/${latestCreatedInvite.acceptToken}`}
                </p>
                <button
                  type="button"
                  onClick={() => handleCopyInviteLink(latestCreatedInvite.acceptToken)}
                  className="mt-3 inline-flex min-h-touch items-center gap-2 rounded-lg bg-earth px-3.5 py-2 text-caption font-semibold text-on-brand hover:bg-earth/90"
                >
                  {copiedLink ? (
                    <Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Copy className="h-4 w-4" aria-hidden="true" />
                  )}
                  <span>{copiedLink ? 'Copied' : 'Copy Invite Link'}</span>
                </button>
              </div>
            ) : null}
          </section>
        </PermissionGate>
      </div>

      {/* Section 3: Active Team Members */}
      <section
        aria-labelledby="team-members-heading"
        className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
      >
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-olive" aria-hidden="true" />
          <h2
            id="team-members-heading"
            className="font-display text-subtitle font-bold text-earth"
          >
            Active Team Members ({members.length})
          </h2>
        </div>

        <div className="mt-4 space-y-3">
          {members.map((member) => {
            const isEditing = editingMemberId === member.userId;
            return (
              <div
                key={member.membershipId}
                className="rounded-xl border border-border-subtle bg-canvas p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-caption font-semibold text-earth">
                        User {shortId(member.userId)}
                      </span>
                      {member.isPrimaryOwner ? (
                        <StatusBadge variant="success" label="Primary Owner" />
                      ) : member.role === 'OWNER' ? (
                        <StatusBadge variant="info" label="Owner" />
                      ) : (
                        <StatusBadge variant="info" label="Staff" />
                      )}
                    </div>
                    <p className="text-caption text-earth/75">
                      Joined {formatAccraDateTime(member.joinedAt)}
                    </p>
                    <div className="pt-1">
                      {member.role === 'OWNER' ? (
                        <span className="text-caption font-medium text-earth">
                          Scope: All company properties
                        </span>
                      ) : member.propertyIds.length === 0 ? (
                        <StatusBadge variant="warning" label="No properties assigned" />
                      ) : (
                        <div className="flex flex-wrap gap-1.5">
                          {member.propertyIds.map((pid) => (
                            <span
                              key={pid}
                              className="rounded-full border border-border-subtle bg-surface-muted px-2.5 py-0.5 font-mono text-micro text-earth"
                            >
                              {shortId(pid)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {canManageStaff && member.role === 'STAFF' && !member.isPrimaryOwner ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          isEditing ? setEditingMemberId(null) : startEditingMember(member)
                        }
                        className="inline-flex min-h-touch items-center rounded-lg border border-border-subtle bg-surface-card px-3.5 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
                      >
                        {isEditing ? 'Cancel' : 'Edit Access'}
                      </button>
                      {member.propertyIds.length > 0 ? (
                        <button
                          type="button"
                          disabled={savingMember}
                          onClick={() => handleSaveMemberPermissions(member.userId, [])}
                          className="inline-flex min-h-touch items-center gap-1.5 rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2 text-caption font-semibold text-status-error-fg hover:opacity-90 disabled:opacity-60"
                        >
                          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                          <span>Revoke All Access</span>
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                {isEditing ? (
                  <div className="mt-4 space-y-3 border-t border-border-subtle pt-4">
                    <FormField
                      id={`member-props-${member.userId}`}
                      label="Permitted Property IDs"
                      value={memberPropsInput}
                      onChange={(e) => setMemberPropsInput(e.target.value)}
                      hint="Comma-separated property UUIDs. Clear the box and save to revoke all property access."
                      placeholder="01950000-0000-7000-8000-000000000001"
                    />
                    {memberEditError ? (
                      <InlineError
                        id={`member-edit-error-${member.userId}`}
                        message={memberEditError}
                      />
                    ) : null}
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={savingMember}
                        onClick={() => handleSubmitMemberEditor(member.userId)}
                        className="inline-flex min-h-touch items-center rounded-lg bg-olive px-4 py-2 text-caption font-semibold text-ivory hover:bg-olive-hover disabled:opacity-60"
                      >
                        {savingMember ? 'Updating…' : 'Save Property Access'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      {/* Section 4: Outstanding Invitations */}
      <PermissionGate requiredPermissions={['org.staff.manage']}>
        <section
          aria-labelledby="invitations-heading"
          className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
        >
          <h2
            id="invitations-heading"
            className="font-display text-subtitle font-bold text-earth"
          >
            Staff Invitations ({invitations.length})
          </h2>

          {invitations.length === 0 ? (
            <div className="mt-4">
              <EmptyState
                icon={MailPlus}
                title="No invitations yet"
                description="Invite a manager or receptionist and choose which properties they can access."
              />
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {invitations.map((inv) => {
                const badge = invitationBadge(inv.status);
                return (
                  <div
                    key={inv.id}
                    className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-earth">{inv.email}</span>
                        <StatusBadge variant={badge.variant} label={badge.label} />
                      </div>
                      <p className="text-caption text-earth/75">
                        {inv.status === 'ACCEPTED' && inv.acceptedAt
                          ? `Accepted ${formatAccraDateTime(inv.acceptedAt)}`
                          : `Expires ${formatAccraDateTime(inv.expiresAt)}`}
                        {' · '}
                        {inv.propertyIds.length}{' '}
                        {inv.propertyIds.length === 1 ? 'property' : 'properties'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {inv.status === 'PENDING' ? (
                        <button
                          type="button"
                          disabled={revokingInviteId === inv.id}
                          onClick={() => handleRevokeInvite(inv)}
                          className="inline-flex min-h-touch items-center gap-1.5 rounded-lg border border-status-error-border bg-status-error-bg px-3.5 py-2 text-caption font-semibold text-status-error-fg hover:opacity-90 disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span>{revokingInviteId === inv.id ? 'Revoking…' : 'Revoke'}</span>
                        </button>
                      ) : inv.status === 'EXPIRED' || inv.status === 'REVOKED' ? (
                        <button
                          type="button"
                          onClick={() => prefillReinvite(inv)}
                          className="inline-flex min-h-touch items-center rounded-lg border border-border-subtle bg-surface-card px-3.5 py-2 text-caption font-semibold text-earth hover:bg-surface-hover"
                        >
                          Re-invite
                        </button>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </PermissionGate>
    </div>
  );
};
