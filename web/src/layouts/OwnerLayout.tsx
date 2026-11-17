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

const ownerNavItems: PortalNavItem[] = [
  { to: '/owner', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/owner/listings', label: 'Listings', shortLabel: 'Listings', icon: Building2 },
  { to: '/owner/verification', label: 'Verification', shortLabel: 'Verify', icon: ShieldCheck },
  { to: '/owner/calendar', label: 'Availability', shortLabel: 'Calendar', icon: CalendarDays },
  { to: '/owner/org', label: 'Team & Org', shortLabel: 'Team', icon: Users },
];

const ownerSecondaryItems: PortalNavItem[] = [
  { to: '/auth/sign-in', label: 'Account & Sign in', icon: UserCircle },
  { to: '/', label: 'Switch to Guest', icon: ArrowLeftRight, end: true },
  { to: '/admin', label: 'Admin Portal', icon: Home },
];

/**
 * Responsive Owner Portal layout shell & navigation (S1-03-T3).
 */
export const OwnerLayout: React.FC = () => (
  <PortalShell
    portalName="Owner Portal"
    portalBadge="Owner"
    badgeClassName="bg-olive text-ivory"
    contextLabel="OrgScope: Organization Space"
    navItems={ownerNavItems}
    secondaryItems={ownerSecondaryItems}
  />
);
