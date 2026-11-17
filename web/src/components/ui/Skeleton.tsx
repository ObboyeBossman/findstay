import React from 'react';

export const SkeletonBox: React.FC<{ className?: string }> = ({
  className = 'h-4 w-full',
}) => (
  <div
    aria-hidden="true"
    className={`animate-pulse rounded-md bg-sand/40 ${className}`.trim()}
  />
);

/**
 * Geometry-matching skeleton card for loading states (S1-03-T5, NFR-03).
 */
export const SkeletonCard: React.FC = () => (
  <div
    aria-busy="true"
    aria-label="Loading content"
    className="rounded-xl border border-border-subtle bg-surface-card p-4"
  >
    <SkeletonBox className="h-5 w-1/3" />
    <SkeletonBox className="mt-3 h-4 w-full" />
    <SkeletonBox className="mt-2 h-4 w-4/5" />
    <div className="mt-4 flex gap-2">
      <SkeletonBox className="h-8 w-24 rounded-full" />
      <SkeletonBox className="h-8 w-20 rounded-full" />
    </div>
  </div>
);

export const SkeletonList: React.FC<{ count?: number }> = ({ count = 2 }) => (
  <div aria-busy="true" aria-label="Loading list" className="space-y-3">
    {Array.from({ length: count }).map((_, idx) => (
      <SkeletonCard key={idx} />
    ))}
  </div>
);
