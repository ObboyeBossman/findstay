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
  {
    to: '/admin',
    label: 'Dashboard',
    shortLabel: 'Home',
    icon: LayoutDashboard,
    end: true,
    requiredPermissions: ['admin.dashboard.read'],
  },
  {
    to: '/admin/reviews',
    label: 'Review Queue',
    shortLabel: 'Queue',
    icon: ClipboardCheck,
    requiredPermissions: ['admin.review.read'],
  },
  {
    to: '/admin/users',
    label: 'Users',
    shortLabel: 'Users',
    icon: Users,
    requiredPermissions: ['admin.user.read'],
  },
  {
    to: '/admin/settings',
    label: 'Settings',
    shortLabel: 'Settings',
    icon: Settings,
    requiredPermissions: ['admin.setting.read'],
  },
  {
    to: '/admin/audit',
    label: 'Audit Log',
    shortLabel: 'Audit',
    icon: FileSearch,
    requiredPermissions: ['admin.audit.read'],
  },
];

const adminSecondaryItems: PortalNavItem[] = [
  { to: '/profile', label: 'My Profile', icon: UserCircle, authState: 'authenticated' },
  { to: '/auth/sign-in', label: 'Account & Sign in', icon: UserCircle, authState: 'anonymous' },
  { to: '/', label: 'Guest Portal', icon: ArrowLeftRight, end: true },
];

/**
 * Responsive Admin Portal layout shell & role-aware navigation (S1-03-T4, S1-06-T4).
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
