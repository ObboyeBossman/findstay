import React, { useState } from 'react';
import { Bell, Building2, Home, Menu, Search, ShieldCheck, UserCircle, X } from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';
import { BrandMark } from './BrandMark';
import { SystemStatus } from './SystemStatus';
import { useToast } from './ui';

const areas = [
  { to: '/', label: 'Guest', icon: Home },
  { to: '/owner', label: 'Owner', icon: Building2 },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

/**
 * App chrome shared by every area: header with area navigation, the routed
 * page, and a footer carrying the live system status. Mobile-first: the
 * nav wraps on small screens, no JavaScript needed for the shell.
 */
export const AppLayout: React.FC = () => {
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const explainSearch = () =>
    showToast({
      variant: 'info',
      title: 'Search is on its way',
      message: 'Accommodation search is delivered in Sprint 2.',
    });

  return (
    <div className="flex min-h-screen bg-white text-earth">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-24 flex-col border-r border-border-subtle bg-white py-4 lg:flex">
        <div className="flex justify-center">
          <BrandMark compact />
        </div>
        <nav aria-label="Portal areas" className="mt-10 flex flex-1 flex-col items-center gap-6">
          {areas.map((a) => {
            const Icon = a.icon;
            return (
              <NavLink
                key={a.to}
                to={a.to}
                end={a.to === '/'}
                aria-label={a.label}
                className={({ isActive }) =>
                  `group relative inline-flex min-h-[3.75rem] min-w-[3.75rem] items-center justify-center rounded-2xl transition-colors ${
                    isActive ? 'bg-surface-muted text-earth' : 'text-earth/70 hover:bg-surface-hover hover:text-earth'
                  }`
                }
              >
                <Icon className="h-7 w-7" aria-hidden="true" />
                <span className="sr-only">{a.label}</span>
                <span
                  role="tooltip"
                  className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                >
                  {a.label}
                </span>
              </NavLink>
            );
          })}
          <button
            type="button"
            onClick={() =>
              showToast({
                variant: 'info',
                title: 'Notifications',
                message: 'Alerts centre connects in S1-10.',
              })
            }
            aria-label="View notifications"
            className="group relative inline-flex min-h-[3.75rem] min-w-[3.75rem] items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover hover:text-earth"
          >
            <Bell className="h-7 w-7" aria-hidden="true" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Notifications
            </span>
          </button>
        </nav>
        <NavLink
          to="/auth/sign-in"
          aria-label="Sign in"
          className="group relative mx-auto inline-flex min-h-[3.75rem] min-w-[3.75rem] items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover hover:text-earth"
        >
          <UserCircle className="h-7 w-7" aria-hidden="true" />
          <span
            role="tooltip"
            className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            Sign in
          </span>
        </NavLink>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:ml-24">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur">
          <div className="relative mx-auto flex min-h-20 w-full max-w-7xl items-center justify-center gap-2 px-3 sm:gap-4 sm:px-6">
            <BrandMark className="lg:hidden" />

            <button
              type="button"
              onClick={explainSearch}
              aria-label="Search stays, places, or features"
              className="flex h-12 w-full max-w-2xl items-center justify-between rounded-full border-2 border-earth bg-white px-5 text-left text-body-2 text-earth/70 transition-colors hover:bg-surface-hover focus-visible:outline-offset-4 sm:w-4/5"
            >
              <span>Search stays, places, or features</span>
              <Search className="h-7 w-7 shrink-0" aria-hidden="true" />
            </button>

            <div className="absolute right-3 flex shrink-0 items-center sm:right-6 lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? 'Close portal menu' : 'Open portal menu'}
                aria-expanded={mobileMenuOpen}
                className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-full text-earth/75 hover:bg-surface-muted hover:text-earth lg:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <Menu className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>

          {mobileMenuOpen ? (
            <nav
              aria-label="Portal areas"
              className="absolute inset-x-3 top-full z-40 mt-2 grid gap-1 rounded-2xl border border-border-subtle bg-white p-2 shadow-lg lg:hidden"
            >
              {areas.map((a) => (
                <NavLink
                  key={a.to}
                  to={a.to}
                  end={a.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-xl px-3 py-3 text-caption font-semibold transition-colors ${
                      isActive ? 'bg-surface-muted text-earth' : 'text-earth/75 hover:bg-surface-muted hover:text-earth'
                    }`
                  }
                >
                  {a.label}
                </NavLink>
              ))}
            </nav>
          ) : null}
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
          <Outlet />
        </main>

        <footer className="border-t border-earth/15 bg-sand/30">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-caption">
              FindStay — the Sprint 1 starter shell (S1-01-T5). Screens arrive with
              their stories.
            </p>
            <SystemStatus />
          </div>
        </footer>
      </div>
    </div>
  );
};
