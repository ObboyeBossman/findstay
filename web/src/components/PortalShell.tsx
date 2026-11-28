import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Search, type LucideIcon } from 'lucide-react';
import { filterNavItems, useAuth, type AccessRequirement } from '../features/identity';
import { NotificationBell } from '../features/notification';
import { BrandMark } from './BrandMark';
import { SystemStatus } from './SystemStatus';
import { useToast } from './ui';

export interface PortalNavItem extends AccessRequirement {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  end?: boolean;
  badgeCount?: number;
  /** Optional auth visibility filter: show only when signed in or signed out. */
  authState?: 'authenticated' | 'anonymous' | 'any';
}

interface PortalShellProps {
  portalName: string;
  portalBadge: string;
  badgeClassName: string;
  contextLabel?: string;
  navItems: PortalNavItem[];
  secondaryItems: PortalNavItem[];
}

/**
 * Shared responsive portal shell (S1-03-T1, T3, T4 + S1-06-T4 role-aware menus):
 * Maintains the same persistent left sidebar on mobile (compact `w-16`) and
 * desktop (`lg:w-24`), filters links against the signed-in user's roles and
 * permissions, and maintains zero horizontal overflow at 360px.
 */
export const PortalShell: React.FC<PortalShellProps> = ({
  portalName,
  portalBadge,
  badgeClassName,
  contextLabel,
  navItems,
  secondaryItems,
}) => {
  const { showToast } = useToast();
  const { session, sessionContext, signOut } = useAuth();
  const navigate = useNavigate();

  const filterByAuthAndPermissions = (items: readonly PortalNavItem[]): PortalNavItem[] =>
    filterNavItems(items, sessionContext).filter((item) => {
      if (item.authState === 'authenticated') return Boolean(session);
      if (item.authState === 'anonymous') return !session;
      return true;
    });

  const visibleNavItems = filterByAuthAndPermissions(navItems);
  const visibleSecondaryItems = filterByAuthAndPermissions(secondaryItems);

  const handleSignOut = async () => {
    await signOut();
    showToast({ variant: 'info', title: 'Signed out' });
    navigate('/auth/sign-in');
  };

  const renderNavLink = (item: PortalNavItem) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        aria-label={item.label}
        className={({ isActive }) =>
          `group relative flex min-h-touch min-w-touch items-center justify-center rounded-2xl px-2 py-2 text-caption font-medium transition-colors lg:min-h-rail lg:min-w-rail ${
            isActive
              ? 'bg-olive text-ivory'
              : 'text-earth hover:bg-surface-hover'
          }`
        }
      >
        <Icon className="h-6 w-6 shrink-0 lg:h-7 lg:w-7" aria-hidden="true" />
        <span className="sr-only">{item.label}</span>
        {typeof item.badgeCount === 'number' && item.badgeCount > 0 ? (
          <span className="absolute right-1 top-1 rounded-full bg-terracotta-dark px-1.5 py-0.5 text-nano font-bold text-ivory">
            {item.badgeCount}
          </span>
        ) : null}
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
        >
          {item.label}
        </span>
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-surface-card text-earth">
      {/* Persistent sidebar: compact on mobile (w-16), wider on desktop (lg:w-24) */}
      <aside
        aria-label={`${portalName} sidebar`}
        className="fixed inset-y-0 left-0 z-overlay flex w-16 flex-col bg-surface-card lg:w-24"
      >
        <div className="flex h-16 flex-col items-center justify-center gap-1">
          <BrandMark compact />
          <span className={`rounded-full px-1.5 py-0.5 text-nano font-bold uppercase tracking-wider lg:px-2 ${badgeClassName}`}>
            {portalBadge}
          </span>
        </div>

        {contextLabel ? (
          <span className="sr-only">{contextLabel}</span>
        ) : null}

        <nav aria-label={`${portalName} navigation`} className="flex flex-1 flex-col items-center gap-3 overflow-y-auto py-6 lg:gap-6 lg:py-8">
          {visibleNavItems.map((item) => renderNavLink(item))}
          <NotificationBell />
        </nav>

        <div className="flex flex-col items-center gap-2 py-3 lg:gap-3 lg:py-4">
          {visibleSecondaryItems.map((item) => renderNavLink(item))}
          {session ? (
            <button
              type="button"
              onClick={handleSignOut}
              aria-label={`Sign out (${sessionContext?.profile.fullName ?? session.user.email ?? 'Account'})`}
              className="group relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover hover:text-earth lg:min-h-rail lg:min-w-rail"
            >
              <LogOut className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                Sign out
              </span>
            </button>
          ) : null}
        </div>
      </aside>

      {/* Main column */}
      <div className="ml-16 flex min-w-0 flex-1 flex-col lg:ml-24">
        {/* Top bar */}
        <header className="sticky top-0 z-sticky bg-surface-card/95 backdrop-blur">
          <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-center px-3 sm:px-6">
            <button
              type="button"
              onClick={() =>
                showToast({
                  variant: 'info',
                  title: 'Search is on its way',
                  message: 'Accommodation search is delivered in Sprint 2.',
                })
              }
              aria-label="Search stays, places, or features"
              className="flex h-12 w-full max-w-2xl items-center justify-between gap-2 rounded-full border-2 border-earth bg-surface-card px-4 text-left text-caption text-earth/70 transition-colors hover:bg-surface-hover focus-visible:outline-offset-4 sm:w-4/5 sm:px-5 sm:text-body-2"
            >
              <span className="truncate">Search stays, places, or features</span>
              <Search className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Routed portal content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 lg:px-8">
          <Outlet />
        </main>

        <footer className="border-t border-border-subtle bg-surface-muted/50">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-caption text-earth/80">
              FindStay — {portalName} Shell (S1-03)
            </p>
            <SystemStatus />
          </div>
        </footer>
      </div>
    </div>
  );
};
