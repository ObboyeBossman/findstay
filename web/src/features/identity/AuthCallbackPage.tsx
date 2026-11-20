import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ApiClientError } from '../../lib/api';
import { supabase } from '../../lib/supabase';
import { resolveHomeRoute, useAuth } from './AuthContext';

type CallbackState = 'verifying' | 'success' | 'error';

export const AuthCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { provisionAccount } = useAuth();
  const [state, setState] = useState<CallbackState>('verifying');
  const [errorMessage, setErrorMessage] = useState<string>(
    'This verification link has expired or is invalid.',
  );

  useEffect(() => {
    let active = true;

    const completeVerification = async () => {
      if (!supabase) {
        if (active) {
          setState('error');
          setErrorMessage('Authentication is not configured in this environment.');
        }
        return;
      }

      const urlError =
        searchParams.get('error_description') ?? searchParams.get('error');
      if (urlError) {
        if (active) {
          setState('error');
          setErrorMessage(urlError);
        }
        return;
      }

      try {
        const code = searchParams.get('code');
        let accessToken: string | undefined;

        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            throw error;
          }
          accessToken = data.session?.access_token;
        } else {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            throw error;
          }
          accessToken = data.session?.access_token;
        }

        if (!accessToken) {
          throw new Error('This verification link has expired or has already been used.');
        }

        let homeRoute = '/';
        try {
          const ctx = await provisionAccount(accessToken);
          homeRoute = resolveHomeRoute(ctx);
        } catch (apiErr) {
          if (apiErr instanceof ApiClientError && apiErr.status === 403) {
            throw apiErr;
          }
          // API may not be running during frontend-only auth testing; lazy /me provision handles it later.
        }
        if (!active) return;
        setState('success');
        window.setTimeout(() => {
          if (active) {
            navigate(homeRoute, { replace: true });
          }
        }, 800);
      } catch (err) {
        if (!active) return;
        setState('error');
        setErrorMessage(
          err instanceof Error
            ? err.message
            : 'This verification link has expired or is invalid.',
        );
      }
    };

    completeVerification();

    return () => {
      active = false;
    };
  }, [navigate, provisionAccount, searchParams]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-center shadow-sm sm:p-8">
        {state === 'verifying' ? (
          <>
            <Loader2
              className="mx-auto h-10 w-10 animate-spin text-olive"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-heading-2 text-earth">
              Verifying your email...
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">
              Setting up your FindStay account.
            </p>
          </>
        ) : null}

        {state === 'success' ? (
          <>
            <CheckCircle2
              className="mx-auto h-12 w-12 text-status-success-fg"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-heading-2 text-earth">
              Email verified!
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">
              Taking you to your FindStay dashboard...
            </p>
          </>
        ) : null}

        {state === 'error' ? (
          <>
            <AlertTriangle
              className="mx-auto h-12 w-12 text-status-warning-fg"
              aria-hidden="true"
            />
            <h1 className="mt-4 font-display text-heading-2 text-earth">
              Verification link invalid
            </h1>
            <p className="mt-2 text-body-2 text-earth/75">{errorMessage}</p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/auth/sign-in"
                className="inline-flex min-h-touch items-center justify-center rounded-xl bg-olive px-4 py-3 text-body-2 font-semibold text-on-brand transition-colors hover:bg-olive-hover"
              >
                Proceed to sign in
              </Link>
              <Link
                to="/auth/sign-up"
                className="text-body-2 font-semibold text-terracotta hover:underline"
              >
                Create a new account
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};
