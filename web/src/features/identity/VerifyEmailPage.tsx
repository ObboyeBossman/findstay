import React, { useEffect, useState } from 'react';
import { MailCheck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useToast } from '../../components/ui';
import { supabase } from '../../lib/supabase';

const COOLDOWN_SECONDS = 60;

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const { showToast } = useToast();
  const stateEmail =
    (location.state as { email?: string } | null)?.email ?? '';
  const [email] = useState(stateEmail);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (!supabase || !email || cooldown > 0) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        showToast({ variant: 'error', title: 'Could not resend', message: error.message });
      } else {
        showToast({ variant: 'success', title: 'Verification email sent' });
        setCooldown(COOLDOWN_SECONDS);
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-surface-muted text-olive">
          <MailCheck className="h-7 w-7" aria-hidden="true" />
        </div>

        <h1 className="mt-4 font-display text-heading-2 text-earth">
          Verify your email
        </h1>
        <p className="mt-2 text-body-2 text-earth/75">
          We sent a confirmation link{' '}
          {email ? (
            <>
              to <span className="font-semibold text-earth">{email}</span>
            </>
          ) : (
            'to your email address'
          )}
          . Click the link in your inbox to activate your FindStay account.
        </p>

        {email ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            className="mt-6 min-h-touch w-full rounded-xl border border-olive bg-surface-card px-4 py-3 text-body-2 font-semibold text-olive transition-colors hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            {cooldown > 0
              ? `Resend verification email (${cooldown}s)`
              : resending
                ? 'Sending...'
                : 'Resend verification email'}
          </button>
        ) : null}

        <p className="mt-6 text-body-2 text-earth/75">
          <Link to="/auth/sign-in" className="font-semibold text-terracotta hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
