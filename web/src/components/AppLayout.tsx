import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { SystemStatus } from './SystemStatus';

const areas = [
  { to: '/', label: 'Guest' },
  { to: '/owner', label: 'Owner' },
  { to: '/admin', label: 'Admin' },
];

const accounts = [
  { to: '/auth/sign-in', label: 'Sign in' },
  { to: '/auth/sign-up', label: 'Sign up' },
];

/**
 * App chrome shared by every area: header with area navigation, the routed
 * page, and a footer carrying the live system status. Mobile-first: the
 * nav wraps on small screens, no JavaScript needed for the shell.
 */
export const AppLayout: React.FC = () => (
  <div className="flex min-h-screen flex-col bg-white text-earth">
    <header className="bg-olive text-ivory">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="font-display text-label font-bold tracking-tight">
          FindStay
        </Link>
        <nav aria-label="Portal areas" className="flex flex-wrap gap-4">
          {areas.map((a) => (
            <NavLink
              key={a.to}
              to={a.to}
              end={a.to === '/'}
              className={({ isActive }) =>
                `text-caption font-medium underline-offset-4 ${
                  isActive ? 'underline' : 'opacity-80 hover:opacity-100'
                }`
              }
            >
              {a.label}
            </NavLink>
          ))}
        </nav>
        <nav aria-label="Account" className="ml-auto flex gap-4">
          {accounts.map((a) => (
            <NavLink
              key={a.to}
              to={a.to}
              className={({ isActive }) =>
                `text-caption font-medium underline-offset-4 ${
                  isActive ? 'underline' : 'opacity-80 hover:opacity-100'
                }`
              }
            >
              {a.label}
            </NavLink>
          ))}
        </nav>
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
);
