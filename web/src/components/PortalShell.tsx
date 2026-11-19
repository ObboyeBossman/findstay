import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Bell, Menu, MoreHorizontal, Search, X, type LucideIcon } from 'lucide-react';
import { BrandMark } from './BrandMark';
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
  badgeClassName: string;
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
  badgeClassName,
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

  const renderNavLink = (item: PortalNavItem, onClick?: () => void, compact = false) => {
    const Icon = item.icon;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.end}
        onClick={onClick}
        className={({ isActive }) =>
          `flex min-h-touch items-center rounded-2xl text-caption font-medium transition-colors ${
            isActive
              ? 'bg-olive text-ivory'
              : 'text-earth hover:bg-surface-hover'
          } ${compact ? 'group relative min-h-rail min-w-rail justify-center px-2 py-2' : 'gap-3 px-3 py-2'}`
        }
      >
        <Icon className={`${compact ? 'h-7 w-7' : 'h-5 w-5'} shrink-0`} aria-hidden="true" />
        <span className={compact ? 'sr-only' : 'truncate'}>{item.label}</span>
        {typeof item.badgeCount === 'number' && item.badgeCount > 0 ? (
          <span className="ml-auto rounded-full bg-terracotta-dark px-2 py-0.5 text-micro font-bold text-ivory">
            {item.badgeCount}
          </span>
        ) : null}
        {compact ? (
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            {item.label}
          </span>
        ) : null}
      </NavLink>
    );
  };

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-surface-card text-earth">
      {/* Desktop persistent sidebar (240px) */}
      <aside
        aria-label={`${portalName} sidebar`}
        className="fixed inset-y-0 left-0 z-overlay hidden w-24 flex-col border-r border-border-subtle bg-surface-card lg:flex"
      >
        <div className="flex h-16 flex-col items-center justify-center gap-1">
          <BrandMark compact />
          <span className={`rounded-full px-2 py-0.5 text-nano font-bold uppercase tracking-wider ${badgeClassName}`}>
            {portalBadge}
          </span>
        </div>

        {contextLabel ? (
          <span className="sr-only">{contextLabel}</span>
        ) : null}

        <nav aria-label={`${portalName} navigation`} className="flex flex-1 flex-col items-center gap-6 py-8">
          {navItems.map((item) => renderNavLink(item, undefined, true))}
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
            className="group relative inline-flex min-h-rail min-w-rail items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover hover:text-earth"
          >
            <Bell className="h-7 w-7" aria-hidden="true" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Notifications
            </span>
          </button>
        </nav>

        <div className="flex flex-col items-center gap-3 border-t border-border-subtle py-4">
          {secondaryItems.map((item) => renderNavLink(item, undefined, true))}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:ml-24">
        {/* Top bar (56px mobile, 64px desktop) */}
        <header className="sticky top-0 z-sticky bg-surface-card/95 backdrop-blur">
          <div className="relative flex min-h-20 items-center justify-center gap-2 px-3 sm:px-6">
            <div className="absolute left-3 flex min-w-0 items-center gap-2 sm:left-6 lg:hidden">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label={`Open ${portalName} menu`}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-surface-muted lg:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
              </button>
              <BrandMark className="lg:hidden" />
              <span className={`rounded-full px-2 py-0.5 text-micro font-bold uppercase tracking-wider lg:hidden ${badgeClassName}`}>
                {portalBadge}
              </span>
            </div>

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
              className="flex h-12 w-full max-w-2xl items-center justify-between rounded-full border-2 border-earth bg-surface-card px-5 text-left text-body-2 text-earth/70 transition-colors hover:bg-surface-hover focus-visible:outline-offset-4 sm:w-4/5"
            >
              <span>Search stays, places, or features</span>
              <Search className="h-7 w-7 shrink-0" aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Mobile/tablet slide-over navigation drawer */}
        {drawerOpen ? (
          <div
            className="fixed inset-0 z-overlay flex lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={`${portalName} navigation drawer`}
          >
            <div
              className="fixed inset-0 bg-earth/50"
              onClick={() => setDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="relative z-raised flex w-72 max-w-drawer flex-col bg-surface-card shadow-xl">
              <div className="flex h-topbar items-center justify-between border-b border-border-subtle px-4">
                <BrandMark />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation menu"
                  className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-lg hover:bg-surface-muted"
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
          className="fixed inset-x-0 bottom-0 z-sticky grid h-bottomnav grid-cols-5 border-t border-border-subtle bg-surface-card md:hidden"
        >
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `relative flex min-h-touch flex-col items-center justify-center gap-0.5 px-1 text-micro font-medium ${
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
            className="flex min-h-touch flex-col items-center justify-center gap-0.5 px-1 text-micro font-medium text-earth/75 hover:text-earth"
          >
            <MoreHorizontal className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span>More</span>
          </button>
        </nav>
      </div>
    </div>
  );
};
