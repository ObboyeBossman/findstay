import React from 'react';
import { Link } from 'react-router-dom';
import logoUrl from '../assets/logo.jpeg';

interface BrandMarkProps {
  className?: string;
  compact?: boolean;
}

/** The FindStay brand mark using the official app logo. */
export const BrandMark: React.FC<BrandMarkProps> = ({ className = '', compact = false }) => (
  <Link
    to="/"
    aria-label="FindStay home"
    className={`group inline-flex shrink-0 items-center gap-2 rounded-2xl p-2 text-earth transition-colors hover:bg-surface-hover/50 focus-visible:outline-none ${className}`}
  >
    <img
      src={logoUrl}
      alt=""
      aria-hidden="true"
      className="h-12 w-12 rounded-xl object-cover transition-transform duration-normal group-hover:scale-105"
    />
    {!compact ? <span className="font-display text-label font-bold tracking-tight">FindStay</span> : null}
  </Link>
);
