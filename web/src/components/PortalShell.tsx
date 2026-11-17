import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Menu, MoreHorizontal, X, type LucideIcon } from 'lucide-react';
import { SystemStatus } from './SystemStatus';
import { useToast } from './ui';

export interface PortalNavItem {
  to: string;
  label: string;
  shortLabel?: string;
  icon: LucideIcon;
  end?: boolean;
  badgeCount?: number;
}

interface PortalShellProps {
  portalName: string;
  portalBadge: string;
  headerClassName: string;
  contextLabel?: string;
  navItems: PortalNavItem[];
  secondaryItems: PortalNavItem[];
}

/**
 * Shared responsive portal shell (S1-03-T1, T3, T4):
 * - 360px+ mobile: 56px top bar + slide-over drawer + 64px sticky bottom bar
 * - Tablet (768px+): collapsible drawer + top bar
 * - Desktop (1024px+): persistent 240px left sidebar + top bar
 * Every nav link pairs an icon with a visible text label (NFR-05).
 */
export const PortalShell: React.FC<PortalShellProps> = ({
  portalName,
  portalBadge,
  headerClassName,
  contextLabel,
  navItems,
  secondaryItems,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const { showToast } = useToast();

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const bottomItems = navItems.slice(0, 4);

  const renderNavLink = (item: PortalNavItem, onClick?: () => void) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClick}
        className={({ isActive }) =>
          `flex min-h-touch items-center gap-3 rounded-lg px-3 py-2 text-caption font-medium transition-colors ${
            isActive
              ? 'bg-olive text-ivory'
              : 'text-earth hover:bg-surface-muted'
          }`
        }
      >
        <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.label}</span>
        {typeof item.badgeCount === 'number' && item.badgeCount > 0 ? (
          <span className="ml-auto rounded-full bg-terracotta-dark px-2 py-0.5 text-[11px] font-bold text-ivory">
            {item.badgeCount}
          </span>
        ) : null}
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-white text-earth">
      {/* Desktop persistent sidebar (240px) */}
      <aside
        aria-label={`${portalName} sidebar`}
        className="hidden w-sidebar shrink-0 flex-col border-r border-border-subtle bg-surface-card lg:flex"
      >
        <div className={`flex h-16 items-center justify-between px-4 ${headerClassName}`}>
          <Link to="/" className="font-display text-label font-bold tracking-tight">
            FindStay
          </Link>
          <span className="rounded-full border border-ivory/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider">
            {portalBadge}
          </span>
        </div>

        {contextLabel ? (
          <div className="border-b border-border-subtle bg-surface-muted/70 px-4 py-2.5 text-caption font-semibold text-earth">
            {contextLabel}
          </div>
        ) : null}

        <nav aria-label={`${portalName} navigation`} className="flex-1 space-y-1 p-3">
          {navItems.map((item) => renderNavLink(item))}
        </nav>

        <div className="border-t border-border-subtle p-3 space-y-1">
          {secondaryItems.map((item) => renderNavLink(item))}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (56px mobile, 64px desktop) */}
        <header className={`sticky top-0 z-30 border-b border-earth/10 ${headerClassName}`}>
          <div className="flex h-topbar items-center justify-between gap-2 px-3 sm:px-6 lg:h-16">
            <div className="flex min-w-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label={`Open ${portalName} menu`}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-ivory/15 lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <Link
                to="/"
                className="truncate font-display text-label font-bold tracking-tight lg:hidden"
              >
                FindStay
              </Link>
              <span className="rounded-full border border-ivory/40 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider lg:hidden">
                {portalBadge}
              </span>
              <span className="hidden truncate text-caption font-medium opacity-90 lg:inline">
                {portalName} · <code className="font-mono">{pathname}</code>
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                showToast({
                  variant: 'info',
                  title: `${portalName} alerts`,
                  message: 'Real-time notifications connect in S1-10.',
                })
              }
              aria-label="View notifications"
              className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-ivory/15"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Mobile/tablet slide-over navigation drawer */}
        {drawerOpen ? (
          <div
            className="fixed inset-0 z-40 flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`${portalName} navigation drawer`}
          >
            <div
              className="fixed inset-0 bg-earth/50"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-surface-card shadow-xl">
              <div className={`flex h-topbar items-center justify-between px-4 ${headerClassName}`}>
                <span className="font-display text-label font-bold">{portalName}</span>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-ivory/15"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              {contextLabel ? (
                <div className="border-b border-border-subtle bg-surface-muted/70 px-4 py-2.5 text-caption font-semibold">
                  {contextLabel}
                </div>
              ) : null}
              <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                {navItems.map((item) =>
                  renderNavLink(item, () => setDrawerOpen(false)),
                )}
              </nav>
              <div className="border-t border-border-subtle p-3 space-y-1">
                {secondaryItems.map((item) =>
                  renderNavLink(item, () => setDrawerOpen(false)),
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Routed portal content */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-24 md:pb-8 lg:px-8">
          <Outlet />
        </main>

        <footer className="hidden border-t border-border-subtle bg-surface-muted/50 md:block">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <p className="text-caption text-earth/80">
              FindStay — {portalName} Shell (S1-03)
            </p>
            <SystemStatus />
          </div>
        </footer>

        {/* Mobile sticky bottom bar (< 768px) with icon + short label */}
        <nav
          aria-label={`${portalName} quick navigation`}
          className="fixed inset-x-0 bottom-0 z-30 grid h-bottomnav grid-cols-5 border-t border-border-subtle bg-surface-card md:hidden"
        >
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex min-h-touch flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium ${
                    isActive
                      ? 'text-olive font-bold'
                      : 'text-earth/75 hover:text-earth'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate max-w-full">
                  {item.shortLabel ?? item.label}
                </span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex min-h-touch flex-col items-center justify-center gap-0.5 px-1 text-[11px] font-medium text-earth/75 hover:text-earth"
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
