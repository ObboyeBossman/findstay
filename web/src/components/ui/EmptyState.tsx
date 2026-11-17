import React from 'react';
import { Inbox, type LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Centered empty state card with icon, plain-language explanation, and
 * optional primary action button (S1-03-T5).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-subtle bg-surface-card px-4 py-10 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-olive">
      <Icon className="h-6 w-6" aria-hidden="true" />
    </div>
    <h2 className="font-display text-subtitle font-bold text-earth">{title}</h2>
    <p className="mt-1 max-w-md text-body-2 text-earth/75">{description}</p>
    {actionLabel && onAction ? (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 inline-flex min-h-touch items-center justify-center rounded-lg bg-olive px-4 py-2 text-caption font-semibold text-ivory hover:bg-olive-hover"
      >
        {actionLabel}
      </button>
    ) : null}
  </div>
);
