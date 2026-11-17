import React from 'react';
import {
  ArrowLeftRight,
  ClipboardCheck,
  FileSearch,
  LayoutDashboard,
  Settings,
  UserCircle,
  Users,
} from 'lucide-react';
import { PortalShell, type PortalNavItem } from '../components/PortalShell';

const adminNavItems: PortalNavItem[] = [
  { to: '/admin', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard, end: true },
  { to: '/admin/reviews', label: 'Review Queue', shortLabel: 'Queue', icon: ClipboardCheck },
  { to: '/admin/users', label: 'Users', shortLabel: 'Users', icon: Users },
  { to: '/admin/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
  { to: '/admin/audit', label: 'Audit Log', shortLabel: 'Audit', icon: FileSearch },
];

const adminSecondaryItems: PortalNavItem[] = [
  { to: '/auth/sign-in', label: 'Account & Sign in', icon: UserCircle },
  { to: '/', label: 'Guest Portal', icon: ArrowLeftRight, end: true },
];

/**
 * Responsive Admin Portal layout shell & navigation (S1-03-T4).
 */
export const AdminLayout: React.FC = () => (
  <PortalShell
    portalName="Admin Portal"
    portalBadge="Admin"
    badgeClassName="bg-earth text-ivory"
    contextLabel="Platform Governance"
    navItems={adminNavItems}
    secondaryItems={adminSecondaryItems}
  />
);
