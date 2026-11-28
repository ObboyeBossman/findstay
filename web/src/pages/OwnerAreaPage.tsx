import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { ShellPage, StoryPlaceholder } from '../components/ShellPage';
import { StatusBadge } from '../components/StatusBadge';
import {
  EmptyState,
  FormField,
  SkeletonList,
  useToast,
} from '../components/ui';
import { useAuth } from '../features/identity';

/**
 * Owner/company area entry. Serves both /owner and any /owner/... subpath,
 * and demonstrates the shared S1-03-T2/T5 state patterns + S1-06-T4 action gating.
 */
export const OwnerAreaPage: React.FC = () => {
  const { pathname } = useLocation();
  const { showToast } = useToast();
  const { hasPermission } = useAuth();
  const canCreateListing = hasPermission('listing.write');
  const [previewMode, setPreviewMode] = useState<'empty' | 'loading'>('empty');
  const [samplePrice, setSamplePrice] = useState('');
  const priceError =
    samplePrice !== '' && Number(samplePrice) <= 0
      ? 'Enter a nightly rate greater than GH₵ 0.'
      : undefined;

  return (
    <div className="space-y-6">
      <ShellPage eyebrow="Owner / company area" title="Your properties, in one place">
        <p className="text-body-2">
          Owners and staff manage the company space, submit verification
          documents (Ghana Card, ownership proof, GTA licence), build listings
          with photos, units and prices, and keep the availability calendar
          that prevents double bookings.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge variant="success" label="Verified Owner" />
          <StatusBadge variant="warning" label="Pending Review" />
          <StatusBadge variant="error" label="Action Required" />
          <StatusBadge variant="info" label="Draft" />
        </div>
      </ShellPage>

      <StoryPlaceholder
        story="S1-07, S1-12, S1-13, S1-14"
        summary={`The dashboard, verification, listing and calendar screens fill this area. You are at ${pathname} — every owner route already resolves to this area entry.`}
      />

      <section
        aria-label="Shared UI state patterns"
        className="space-y-4 rounded-xl border border-border-subtle bg-surface-card p-4 sm:p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-subtitle font-bold">
            Shared State Patterns (S1-03-T5)
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                showToast({
                  variant: 'success',
                  title: 'Listing saved',
                  message: 'Your draft is safely stored.',
                })
              }
              className="min-h-touch rounded-lg bg-olive px-3 py-2 text-caption font-semibold text-ivory hover:bg-olive-hover"
            >
              Test Toast
            </button>
            <button
              type="button"
              onClick={() =>
                setPreviewMode((m) => (m === 'empty' ? 'loading' : 'empty'))
              }
              className="min-h-touch rounded-lg border border-border-subtle bg-surface-muted px-3 py-2 text-caption font-semibold text-earth hover:bg-sand/30"
            >
              {previewMode === 'empty' ? 'Show Loading' : 'Show Empty'}
            </button>
          </div>
        </div>

        <FormField
          id="sample-rate"
          label="Nightly Rate (GH₵)"
          type="number"
          placeholder="e.g. 450"
          hint="Displayed in GHS; stored in integer pesewas."
          value={samplePrice}
          onChange={(e) => setSamplePrice(e.target.value)}
          error={priceError}
        />

        {previewMode === 'loading' ? (
          <SkeletonList count={2} />
        ) : (
          <EmptyState
            icon={Building2}
            title="No properties added yet"
            description="Add your first lodge, guesthouse, or apartment to start verification."
            actionLabel={canCreateListing ? '+ Add Property' : undefined}
            onAction={
              canCreateListing
                ? () =>
                    showToast({
                      variant: 'info',
                      title: 'Add Property',
                      message: 'Property creation arrives in S1-13.',
                    })
                : undefined
            }
          />
        )}
      </section>
    </div>
  );
};
