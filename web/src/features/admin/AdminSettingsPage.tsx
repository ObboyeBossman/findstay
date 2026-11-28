import React, { useCallback, useEffect, useId, useState } from 'react';
import { Clock, Flag, Info, Save, Settings } from 'lucide-react';
import { InlineError, SkeletonCard, useToast } from '../../components/ui';
import { formatAuditGhanaTime } from '../audit';
import { useAuth } from '../identity';
import { fetchPlatformSettings, updatePlatformSetting } from './api';
import type { PlatformSettingItem } from './types';
import { validatePlatformSettingValue } from './validation';

/**
 * Admin Platform Settings & Feature Flags (`SCR-21B`, `S1-16-T5`):
 * Reads and updates `admin.platform_setting` rows with old -> new value audit logging.
 */
export const AdminSettingsPage: React.FC = () => {
  const { session, hasPermission } = useAuth();
  const { showToast } = useToast();
  const errorId = useId();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<PlatformSettingItem[]>([]);
  const [draftValues, setDraftValues] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const canWrite = hasPermission('admin.setting.write');

  const loadSettings = useCallback(async () => {
    const token = session?.access_token;
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchPlatformSettings(token);
      setSettings(list);
      const initialDrafts: Record<string, string> = {};
      for (const item of list) {
        initialDrafts[item.key] = item.value;
      }
      setDraftValues(initialDrafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load platform settings.');
    } finally {
      setLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  const handleSaveSetting = async (item: PlatformSettingItem, nextValue: string) => {
    const token = session?.access_token;
    if (!token || !canWrite) return;

    const validationErr = validatePlatformSettingValue(item.key, nextValue, item.isFeatureFlag);
    if (validationErr) {
      setError(validationErr);
      return;
    }

    setSavingKey(item.key);
    setError(null);
    try {
      const updated = await updatePlatformSetting(token, item.key, nextValue.trim());
      setSettings((prev) => prev.map((s) => (s.key === updated.key ? updated : s)));
      setDraftValues((prev) => ({ ...prev, [updated.key]: updated.value }));
      showToast({
        variant: 'success',
        title: 'Setting updated',
        message: `${updated.key} updated to "${updated.value}" and recorded in the audit log.`,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update setting.');
    } finally {
      setSavingKey(null);
    }
  };

  const parameters = settings.filter((s) => !s.isFeatureFlag);
  const featureFlags = settings.filter((s) => s.isFeatureFlag);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-heading-2 font-bold text-earth">
          Platform Settings &amp; Feature Flags
        </h1>
        <p className="mt-1 text-body-2 text-earth/75">
          Manage Release 1 compliance parameters and dark-launched feature flags without code redeploys.
        </p>
      </div>

      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-status-info-border bg-status-info-bg p-4"
      >
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-status-info-fg" aria-hidden="true" />
        <p className="text-body-2 text-status-info-fg">
          Every change on this page is permanently recorded in the Audit Log with your admin ID, old value, and new value.
        </p>
      </div>

      {error ? <InlineError id={errorId} message={error} /> : null}

      {loading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {/* Section 1: Compliance & Platform Parameters */}
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-olive" aria-hidden="true" />
              <h2 className="font-display text-heading-4 font-bold text-earth">
                Compliance &amp; Platform Parameters
              </h2>
            </div>

            <ul className="space-y-3">
              {parameters.map((item) => {
                const currentDraft = draftValues[item.key] ?? item.value;
                const isDirty = currentDraft.trim() !== item.value;
                return (
                  <li
                    key={item.key}
                    className="rounded-xl border border-border-subtle bg-canvas p-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                      <div className="flex-1 space-y-1">
                        <code className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-caption font-bold text-earth">
                          {item.key}
                        </code>
                        {item.description ? (
                          <p className="text-caption text-earth/80">{item.description}</p>
                        ) : null}
                        <p className="inline-flex items-center gap-1 text-micro text-earth/60">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          Last updated: {formatAuditGhanaTime(item.updatedAt)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          aria-label={`Value for ${item.key}`}
                          disabled={!canWrite}
                          value={currentDraft}
                          onChange={(e) =>
                            setDraftValues((prev) => ({ ...prev, [item.key]: e.target.value }))
                          }
                          className="min-h-touch w-40 rounded-xl border border-border-subtle bg-surface-card px-3 py-2 text-body-2 text-earth disabled:opacity-60"
                        />
                        {canWrite ? (
                          <button
                            type="button"
                            disabled={!isDirty || savingKey === item.key}
                            onClick={() => void handleSaveSetting(item, currentDraft)}
                            className="inline-flex min-h-touch items-center gap-1.5 rounded-xl bg-olive px-4 py-2 text-caption font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" aria-hidden="true" />
                            {savingKey === item.key ? 'Saving…' : 'Update Setting'}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Section 2: Feature Flags */}
          <section className="space-y-4 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-olive" aria-hidden="true" />
              <h2 className="font-display text-heading-4 font-bold text-earth">
                Feature Flags (C7 Dark Launches)
              </h2>
            </div>

            <ul className="space-y-3">
              {featureFlags.map((flag) => {
                const enabled = flag.value.toLowerCase() === 'true';
                return (
                  <li
                    key={flag.key}
                    className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <code className="rounded-md bg-surface-muted px-2 py-0.5 font-mono text-caption font-bold text-earth">
                          {flag.key}
                        </code>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-micro font-bold ${
                            enabled
                              ? 'border-status-success-border bg-status-success-bg text-status-success-fg'
                              : 'border-border-subtle bg-surface-muted text-earth'
                          }`}
                        >
                          {enabled ? 'ON' : 'OFF'}
                        </span>
                      </div>
                      {flag.description ? (
                        <p className="text-caption text-earth/80">{flag.description}</p>
                      ) : null}
                      <p className="inline-flex items-center gap-1 text-micro text-earth/60">
                        <Clock className="h-3 w-3" aria-hidden="true" />
                        Last updated: {formatAuditGhanaTime(flag.updatedAt)}
                      </p>
                    </div>

                    {canWrite ? (
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        disabled={savingKey === flag.key}
                        onClick={() => void handleSaveSetting(flag, enabled ? 'false' : 'true')}
                        className={`inline-flex min-h-touch shrink-0 items-center gap-2 rounded-xl border px-4 py-2 text-caption font-semibold transition-colors disabled:opacity-50 ${
                          enabled
                            ? 'border-olive bg-olive text-on-brand hover:bg-olive-hover'
                            : 'border-border-subtle bg-surface-card text-earth hover:bg-surface-hover'
                        }`}
                      >
                        {savingKey === flag.key
                          ? 'Updating…'
                          : enabled
                            ? 'Disable Flag'
                            : 'Enable Flag'}
                      </button>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
};
