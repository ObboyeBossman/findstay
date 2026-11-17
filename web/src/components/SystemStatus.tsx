import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/api';

type Health = { status?: string };

type State =
  | { kind: 'checking' }
  | { kind: 'up'; status: string }
  | { kind: 'down' };

/**
 * Live system status (TA-02): the website's proof it can reach the backend.
 * Polls the public health endpoint under /api/v1 and shows a green/red dot.
 * Until T11 publishes the public /api/v1/health endpoint this honestly shows
 * "unreachable" — no fake green.
 */
export const SystemStatus: React.FC = () => {
  const [state, setState] = useState<State>({ kind: 'checking' });

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`, {
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as Health;
        if (!cancelled) setState({ kind: 'up', status: body.status ?? 'UP' });
      } catch {
        if (!cancelled) setState({ kind: 'down' });
      }
    };
    check();
    const timer = window.setInterval(check, 30_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const dot =
    state.kind === 'up'
      ? 'bg-olive'
      : state.kind === 'down'
        ? 'bg-terracotta'
        : 'bg-sand';
  const label =
    state.kind === 'up'
      ? `API connected (${state.status})`
      : state.kind === 'down'
        ? 'API unreachable'
        : 'Checking API…';

  return (
    <p className="flex items-center gap-2 text-caption" aria-live="polite">
      <span aria-hidden className={`inline-block h-2 w-2 rounded-full ${dot}`} />
      {label}
    </p>
  );
};
