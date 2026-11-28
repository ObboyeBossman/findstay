/** Pure check determining whether a user has accepted the current active policy version (`NFR-36`). */
export function isConsentCurrent(
  state: { policyVersion: string; acceptedAt: string | null; requiresConsent: boolean } | null,
): boolean {
  if (!state) return false;
  return !state.requiresConsent && Boolean(state.acceptedAt);
}

/** Formats a UTC consent timestamp in Ghana time (`Africa/Accra`, GMT). */
export function formatConsentGhanaTime(iso: string | null | undefined): string {
  if (!iso) return 'Not recorded yet';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  return `${new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Accra',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(dt)} GMT`;
}
