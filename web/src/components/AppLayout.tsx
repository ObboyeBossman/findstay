import React from 'react';
import { Bell, Building2, Home, LogOut, Search, ShieldCheck, UserCircle } from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/identity';
import { BrandMark } from './BrandMark';
import { SystemStatus } from './SystemStatus';
import { useToast } from './ui';

const areas = [
  { to: '/', label: 'Guest', icon: Home },
  { to: '/owner', label: 'Owner', icon: Building2 },
  { to: '/admin', label: 'Admin', icon: ShieldCheck },
];

/**
 * App chrome shared by every area: persistent left sidebar (compact on mobile,
 * wider on desktop), top search header, routed page, and footer carrying the
 * live system status.
 */
export const AppLayout: React.FC = () => {
  const { showToast } = useToast();
  const { session, sessionContext, signOut } = useAuth();
  const navigate = useNavigate();

  const [cachedAvatar, setCachedAvatar] = React.useState<string>(() => {
    return localStorage.getItem('findstay_profile_avatar') || '';
  });

  React.useEffect(() => {
    const handleAvatarChange = () => {
      setCachedAvatar(
        localStorage.getItem('findstay_profile_avatar') ||
          sessionContext?.profile.avatarUrl ||
          '',
      );
    };
    window.addEventListener('findstay-avatar-changed', handleAvatarChange);
    return () =>
      window.removeEventListener('findstay-avatar-changed', handleAvatarChange);
  }, [sessionContext]);

  const handleSignOut = async () => {
    await signOut();
    showToast({ variant: 'info', title: 'Signed out' });
    navigate('/auth/sign-in');
  };

  const explainSearch = () =>
    showToast({
      variant: 'info',
      title: 'Search is on its way',
      message: 'Accommodation search is delivered in Sprint 2.',
    });

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-surface-card text-earth">
      <aside className="fixed inset-y-0 left-0 z-overlay flex w-16 flex-col bg-surface-card py-4 lg:w-24">
        <div className="flex justify-center">
          <BrandMark compact />
        </div>
        <nav aria-label="Portal areas" className="flex flex-1 flex-col items-center justify-center gap-4 lg:gap-6">
          {areas
            .filter((a) => a.to !== '/')
            .map((a) => {
              const Icon = a.icon;
              return (
                <NavLink
                  key={a.to}
                  to={a.to}
                  aria-label={a.label}
                  className={({ isActive }) =>
                    `group relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl transition-colors lg:min-h-rail lg:min-w-rail ${isActive ? 'bg-surface-muted text-earth' : 'text-earth/70 hover:bg-surface-hover/50 hover:text-earth'
                    }`
                  }
                >
                  <Icon className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
                  <span className="sr-only">{a.label}</span>
                  <span
                    role="tooltip"
                    className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
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
            className="group relative inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover/50 hover:text-earth lg:min-h-rail lg:min-w-rail"
          >
            <Bell className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Notifications
            </span>
          </button>
        </nav>
        {session ? (
          <div className="flex flex-col items-center gap-2">
            <NavLink
              to="/profile"
              aria-label={`My Profile (${sessionContext?.profile.fullName ?? session.user.email ?? 'Account'})`}
              className={({ isActive }) =>
                `group relative mx-auto inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl transition-colors lg:min-h-rail lg:min-w-rail ${
                  isActive ? 'bg-surface-muted text-earth' : 'text-earth/70 hover:bg-surface-hover/50 hover:text-earth'
                }`
              }
            >
              {cachedAvatar ? (
                <img
                  src={cachedAvatar}
                  alt="Avatar"
                  className="h-6 w-6 rounded-full object-cover lg:h-7 lg:w-7"
                />
              ) : (
                <UserCircle className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
              )}
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                Profile
              </span>
            </NavLink>

            <button
              type="button"
              onClick={handleSignOut}
              aria-label={`Sign out (${sessionContext?.profile.fullName ?? session.user.email ?? 'Account'})`}
              className="group relative mx-auto inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover/50 hover:text-earth lg:min-h-rail lg:min-w-rail"
            >
              <LogOut className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                Sign out
              </span>
            </button>
          </div>
        ) : (
          <NavLink
            to="/auth/sign-in"
            aria-label="Sign in"
            className="group relative mx-auto inline-flex min-h-touch min-w-touch items-center justify-center rounded-2xl text-earth/70 transition-colors hover:bg-surface-hover/50 hover:text-earth lg:min-h-rail lg:min-w-rail"
          >
            <UserCircle className="h-6 w-6 lg:h-7 lg:w-7" aria-hidden="true" />
            <span
              role="tooltip"
              className="pointer-events-none absolute left-full z-top ml-3 whitespace-nowrap rounded-lg bg-earth px-3 py-2 text-caption font-semibold text-on-brand opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
            >
              Sign in
            </span>
          </NavLink>
        )}
      </aside>

      <div className="ml-16 flex min-w-0 flex-1 flex-col lg:ml-24">
        <header className="sticky top-0 z-sticky bg-surface-card/95 backdrop-blur">
          <div className="mx-auto flex min-h-20 w-full max-w-7xl items-center justify-center px-3 sm:px-6">
            <button
              type="button"
              onClick={explainSearch}
              aria-label="Search stays, places, or features"
              className="flex h-12 w-full max-w-2xl items-center justify-between gap-2 rounded-full border-2 border-earth bg-surface-card px-4 text-left text-caption text-earth/70 transition-colors hover:bg-surface-hover focus-visible:outline-offset-4 sm:w-4/5 sm:px-5 sm:text-body-2"
            >
              <span className="truncate">Search stays, places, or features</span>
              <Search className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" aria-hidden="true" />
            </button>
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
