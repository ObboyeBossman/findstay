import { apiFetch } from '../../lib/api';
import type {
  CreatedStaffInvitation,
  OrganizationProfile,
  StaffInvitation,
  StaffMember,
  UpdateOrganizationPayload,
} from './types';

export const PENDING_INVITE_TOKEN_KEY = 'findstay_pending_invite_token';

const ACCRA_DATE_TIME = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Accra',
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Formats an ISO-8601 UTC timestamp for display in Africa/Accra (Ghana GMT). */
export function formatAccraDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return `${ACCRA_DATE_TIME.format(date)} GMT`;
}

export function fetchOwnerOrganization(accessToken: string): Promise<OrganizationProfile> {
  return apiFetch<OrganizationProfile>('/owner/org', { accessToken });
}

export function updateOwnerOrganization(
  accessToken: string,
  payload: UpdateOrganizationPayload,
): Promise<OrganizationProfile> {
  return apiFetch<OrganizationProfile>('/owner/org', {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify(payload),
  });
}

export function fetchOwnerMembers(accessToken: string): Promise<StaffMember[]> {
  return apiFetch<StaffMember[]>('/owner/members', { accessToken });
}

export function updateStaffPermissions(
  accessToken: string,
  userId: string,
  propertyIds: string[],
): Promise<StaffMember> {
  return apiFetch<StaffMember>(`/owner/members/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    accessToken,
    body: JSON.stringify({ propertyIds }),
  });
}

export function fetchOwnerInvitations(accessToken: string): Promise<StaffInvitation[]> {
  return apiFetch<StaffInvitation[]>('/owner/invitations', { accessToken });
}

export function createStaffInvitation(
  accessToken: string,
  email: string,
  propertyIds: string[],
): Promise<CreatedStaffInvitation> {
  return apiFetch<CreatedStaffInvitation>('/owner/invitations', {
    method: 'POST',
    accessToken,
    body: JSON.stringify({ email, propertyIds }),
  });
}

export function revokeStaffInvitation(
  accessToken: string,
  invitationId: string,
): Promise<StaffInvitation> {
  return apiFetch<StaffInvitation>(`/owner/invitations/${encodeURIComponent(invitationId)}`, {
    method: 'DELETE',
    accessToken,
  });
}

export function previewStaffInvitation(token: string): Promise<StaffInvitation> {
  return apiFetch<StaffInvitation>(`/invitations/${encodeURIComponent(token)}`);
}

export function acceptStaffInvitation(
  accessToken: string,
  token: string,
): Promise<StaffMember> {
  return apiFetch<StaffMember>(`/invitations/${encodeURIComponent(token)}/accept`, {
    method: 'POST',
    accessToken,
  });
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Parses a comma/newline-separated list of property UUIDs, rejecting malformed IDs. */
export function parsePropertyIdList(raw: string): { ids: string[]; invalid: string[] } {
  const parts = raw
    .split(/[\s,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const ids: string[] = [];
  const invalid: string[] = [];
  const seen = new Set<string>();
  for (const part of parts) {
    if (UUID_PATTERN.test(part)) {
      const normalized = part.toLowerCase();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        ids.push(normalized);
      }
    } else {
      invalid.push(part);
    }
  }
  return { ids, invalid };
}
