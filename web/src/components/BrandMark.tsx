import React from 'react';
import { Link } from 'react-router-dom';

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

/** The FindStay roof mark is shared with the Sprint progress showcase. */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = '', compact = false }) => (
  <Link
    to="/"
    aria-label="FindStay home"
    className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-1 py-1 text-earth transition-colors hover:bg-surface-muted focus-visible:outline-none ${className}`}
  >
    <svg
      className="h-8 w-8"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M6 21 L24 7 L42 21"
        stroke="var(--color-terracotta)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 30 L11 39 Q11 42 14 42 L34 42 Q37 42 37 39 L37 30"
        stroke="var(--color-terracotta)"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
    {!compact ? <span className="font-display text-label font-bold tracking-tight">FindStay</span> : null}
  </Link>
);
