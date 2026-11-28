import React from 'react';
import {
  ArrowLeftRight,
  Building2,
  CalendarDays,
  Home,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';
import { PortalShell, type PortalNavItem } from '../components/PortalShell';
import { useAuth } from '../features/identity';

const ownerNavItems: PortalNavItem[] = [
  {
    to: '/owner',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    end: true,
    requiredRoles: ['OWNER', 'STAFF'],
  },
  {
    to: '/owner/listings',
    label: 'Listings',
    shortLabel: 'Listings',
    icon: Building2,
    requiredPermissions: ['listing.read'],
  },
  {
    to: '/owner/verification',
    label: 'Verification',
    shortLabel: 'Verify',
    icon: ShieldCheck,
    requiredPermissions: ['verification.read'],
  },
  {
    to: '/owner/calendar',
    label: 'Availability',
    shortLabel: 'Calendar',
    icon: CalendarDays,
    requiredPermissions: ['availability.read'],
  },
  {
    to: '/owner/org',
    label: 'Team & Org',
    shortLabel: 'Team',
    icon: Users,
    requiredPermissions: ['org.staff.manage'],
  },
];

const ownerSecondaryItems: PortalNavItem[] = [
  { to: '/profile', label: 'My Profile', icon: UserCircle, authState: 'authenticated' },
  { to: '/auth/sign-in', label: 'Account & Sign in', icon: UserCircle, authState: 'anonymous' },
  { to: '/', label: 'Switch to Guest', icon: ArrowLeftRight, end: true },
  { to: '/admin', label: 'Admin Portal', icon: Home, requiredRoles: ['ADMIN'] },
];

/**
 * Responsive Owner Portal layout shell & role-aware navigation (S1-03-T3, S1-06-T4).
 */
export const OwnerLayout: React.FC = () => {
  const { sessionContext, role } = useAuth();
  const orgName = sessionContext?.memberships[0]?.organizationName;

  return (
    <PortalShell
      portalName="Owner Portal"
      portalBadge={role === 'STAFF' ? 'Staff' : 'Owner'}
      badgeClassName="bg-olive text-ivory"
      contextLabel={orgName ? `OrgScope: ${orgName}` : 'OrgScope: Organization Space'}
      navItems={ownerNavItems}
      secondaryItems={ownerSecondaryItems}
    />
  );
};
