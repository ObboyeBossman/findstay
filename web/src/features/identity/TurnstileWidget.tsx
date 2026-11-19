import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { TURNSTILE_SITE_KEY } from '../../lib/supabase';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SCRIPT_ID = 'cf-turnstile-script';
const TURNSTILE_SCRIPT_SRC =
  'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

type Props = {
  onVerify: (token: string) => void;
  onExpire: () => void;
};

/**
 * Cloudflare Turnstile bot-protection widget (`S1-04-T6`).
 * When `VITE_TURNSTILE_SITE_KEY` is unset in local development, renders an explicit
 * dev-mode notice so forms remain testable without disabling Turnstile in staging/prod.
 */
export const TurnstileWidget: React.FC<Props> = ({ onVerify, onExpire }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) {
      onVerifyRef.current('dev-turnstile-unconfigured');
      return;
    }

    let cancelled = false;

    const renderWidget = () => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      if (widgetIdRef.current) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (token) => onVerifyRef.current(token),
        'expired-callback': () => onExpireRef.current(),
        'error-callback': () => onExpireRef.current(),
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      let script = document.getElementById(TURNSTILE_SCRIPT_ID) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = TURNSTILE_SCRIPT_ID;
        script.src = TURNSTILE_SCRIPT_SRC;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', renderWidget);
      return () => {
        cancelled = true;
        script?.removeEventListener('load', renderWidget);
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        }
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  if (!TURNSTILE_SITE_KEY) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-caption text-earth/75">
        <ShieldCheck className="h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
        <span>Bot protection active in staging/production (Turnstile site key not set locally).</span>
      </div>
    );
  }

  return <div ref={containerRef} className="min-h-touch" />;
};
