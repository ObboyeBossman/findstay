const EVENT_LABELS: Record<string, string> = {
  WELCOME: 'Welcome to FindStay',
  STAFF_INVITED: 'Team Invitation',
  STAFF_INVITE_ACCEPTED: 'Team Member Joined',
  VERIFICATION_SUBMITTED: 'Verification Submitted',
  VERIFICATION_APPROVED: 'Verification Approved',
  VERIFICATION_REJECTED: 'Verification Rejected',
  VERIFICATION_CHANGES_REQUESTED: 'Verification Changes Requested',
  LISTING_SUBMITTED: 'Listing Submitted',
  LISTING_APPROVED: 'Listing Approved',
  LISTING_REJECTED: 'Listing Rejected',
  LISTING_CHANGES_REQUESTED: 'Listing Changes Requested',
};

export function formatEventLabel(eventType: string): string {
  if (EVENT_LABELS[eventType]) {
    return EVENT_LABELS[eventType];
  }
  return eventType
    .toLowerCase()
    .split('_')
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ''))
    .join(' ');
}

export function formatBadgeCount(unreadCount: number): string | null {
  if (unreadCount <= 0) return null;
  if (unreadCount > 99) return '99+';
  return String(unreadCount);
}
