import React, { useCallback, useEffect, useId, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { InlineError, useToast } from '../../components/ui';
import { useAuth } from '../identity';
import {
  fetchLatestConsentState,
  fetchPrivacyNoticeMetadata,
  formatConsentGhanaTime,
  isConsentCurrent,
  recordPrivacyConsent,
  type ConsentStateResponse,
  type PrivacyNoticeMetadata,
} from './consent';

/**
 * Public Ghana Act 843 Privacy Notice & User Consent Page (`/privacy`, `S1-11-T4`).
 * Displays the approved policy notice (`docs/legal/privacy-notice-act-843.md`) and, when signed in,
 * shows the user's recorded consent timestamp and allows accepting updated policy versions.
 */
export const PrivacyNoticePage: React.FC = () => {
  const { session } = useAuth();
  const { showToast } = useToast();
  const checkboxId = useId();
  const errorId = useId();

  const [metadata, setMetadata] = useState<PrivacyNoticeMetadata | null>(null);
  const [consentState, setConsentState] = useState<ConsentStateResponse | null>(null);
  const [checked, setChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const notice = await fetchPrivacyNoticeMetadata();
      setMetadata(notice);
      if (session?.access_token) {
        const latest = await fetchLatestConsentState(session.access_token);
        setConsentState(latest);
      } else {
        setConsentState(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load privacy notice details.');
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleRecordConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = session?.access_token;
    const version = consentState?.policyVersion ?? metadata?.policyVersion ?? '1';
    if (!token) return;
    if (!checked) {
      setError('Please tick the box to confirm your consent under Ghana Act 843.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await recordPrivacyConsent(token, version);
      showToast({
        variant: 'success',
        title: 'Consent recorded',
        message: `Your acceptance of Privacy Notice v${version} has been saved.`,
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record consent.');
    } finally {
      setSubmitting(false);
    }
  };

  const activeVersion = metadata?.policyVersion ?? consentState?.policyVersion ?? '1';
  const consented = isConsentCurrent(consentState);

  return (
    <div className="mx-auto max-w-4xl space-y-6 py-4">
      <header className="rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-status-info-border bg-status-info-bg px-3 py-1 text-micro font-bold text-status-info-fg">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Ghana Data Protection Act, 2012 (Act 843)
          </span>
          <span className="rounded-full border border-border-subtle bg-surface-muted px-3 py-1 text-micro font-bold text-earth">
            Policy Version {activeVersion}
          </span>
        </div>

        <h1 className="mt-3 font-display text-heading-2 font-bold text-earth">
          FindStay Privacy Notice
        </h1>
        <p className="mt-2 text-body-2 text-earth/80">
          Effective {metadata?.effectiveDate ?? '2026-11-15'} · Supervisory Authority:{' '}
          {metadata?.supervisoryAuthority ?? 'Data Protection Commission (DPC), Ghana'}
        </p>
      </header>

      {/* Live User Consent Card (when authenticated) */}
      {session?.access_token && consentState ? (
        <section className="rounded-2xl border border-border-subtle bg-ivory p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-display text-heading-4 font-bold text-earth">
              Your Act 843 Consent Record
            </h2>
            {consented ? (
              <span className="inline-flex items-center gap-1 rounded-full border border-status-success-border bg-status-success-bg px-3 py-1 text-micro font-bold text-status-success-fg">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Accepted (v{consentState.policyVersion})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full border border-status-warning-border bg-status-warning-bg px-3 py-1 text-micro font-bold text-status-warning-fg">
                Action Required (v{consentState.policyVersion})
              </span>
            )}
          </div>

          {consented ? (
            <p className="mt-2 text-body-2 text-earth/80">
              Recorded on{' '}
              <strong className="font-semibold text-earth">
                {formatConsentGhanaTime(consentState.acceptedAt)}
              </strong>{' '}
              for Policy Version {consentState.policyVersion}.
            </p>
          ) : (
            <form onSubmit={(e) => void handleRecordConsent(e)} className="mt-4 space-y-3">
              <label
                htmlFor={checkboxId}
                className="flex cursor-pointer items-start gap-3 text-body-2 text-earth"
              >
                <input
                  id={checkboxId}
                  type="checkbox"
                  checked={checked}
                  onChange={(e) => setChecked(e.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 rounded border-border-subtle accent-olive"
                />
                <span>
                  I have read this FindStay Privacy Notice (Version {activeVersion}) and consent to
                  the processing of my personal data under Ghana&apos;s Data Protection Act, 2012
                  (Act 843).
                </span>
              </label>

              {error ? <InlineError id={errorId} message={error} /> : null}

              <button
                type="submit"
                disabled={submitting || !checked}
                className="inline-flex min-h-touch items-center justify-center rounded-xl bg-olive px-5 py-2.5 text-body-2 font-semibold text-on-brand hover:bg-olive-hover disabled:opacity-50"
              >
                {submitting ? 'Recording consent…' : `Accept Privacy Notice v${activeVersion}`}
              </button>
            </form>
          )}
        </section>
      ) : null}

      {error && !session?.access_token ? <InlineError id={errorId} message={error} /> : null}

      {/* Core Policy Sections */}
      <article className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-sm">
        <section className="space-y-2">
          <h2 className="font-display text-heading-4 font-bold text-earth">
            1. Data Minimisation — Only What Is Necessary
          </h2>
          <p className="text-body-2 text-earth/85">
            Under Sections 19 &amp; 21 of Act 843, FindStay collects only personal data required to
            deliver secure accommodation bookings and verify legitimate property owners:
          </p>
          <ul className="list-disc space-y-1 pl-5 text-body-2 text-earth/85">
            <li>
              <strong>Guests &amp; Users:</strong> Full name, email address, optional Ghana phone
              number, preferred language, and Act 843 consent record (timestamp, policy version, and
              IP address).
            </li>
            <li>
              <strong>Property Owners:</strong> Ghana Card PIN (AES-256 encrypted at rest and always
              masked in responses), ownership proof, and Ghana Tourism Authority (GTA) licence stored
              in private Cloudflare R2 storage accessed only via 5-minute authorised signed URLs.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-heading-4 font-bold text-earth">
            2. Controlled Disclosure &amp; Zero Data Sales
          </h2>
          <p className="text-body-2 text-earth/85">
            FindStay never sells, rents, or trades your personal data. Public property listings never
            expose personal owner emails, phone numbers, or government ID numbers. Private
            verification documents are strictly limited to the owning account holder and authorised
            FindStay compliance reviewers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-heading-4 font-bold text-earth">
            3. Security Safeguards &amp; Immutable Audit Trail
          </h2>
          <p className="flex items-start gap-2 text-body-2 text-earth/85">
            <Lock className="mt-1 h-4 w-4 shrink-0 text-olive" aria-hidden="true" />
            <span>
              All traffic uses TLS encryption, sensitive IDs are encrypted with AES-256-GCM before
              persistence, organisation isolation (`OrgScope`) separates host data, and sensitive
              administrative actions are written to an append-only audit log.
            </span>
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-display text-heading-4 font-bold text-earth">
            4. Your Rights Under Ghana Act 843
          </h2>
          <p className="text-body-2 text-earth/85">
            Under Sections 32–43 of Act 843, you hold the right of access (review your profile at{' '}
            <Link to="/profile" className="font-semibold text-olive underline">
              /profile
            </Link>
            ), rectification, erasure, objection, withdrawal of consent, and the right to lodge a
            complaint with the Data Protection Commission (DPC) of Ghana.
          </p>
          <p className="text-caption text-earth/75">
            Data Protection Officer contact:{' '}
            <strong className="font-semibold text-earth">
              {metadata?.dpoEmail ?? 'privacy@findstay.com'}
            </strong>
          </p>
        </section>
      </article>
    </div>
  );
};
