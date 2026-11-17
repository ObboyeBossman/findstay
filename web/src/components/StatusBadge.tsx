import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

export type StatusBadgeVariant = 'success' | 'warning' | 'error' | 'info';

interface StatusBadgeProps {
  variant: StatusBadgeVariant;
  label: string;
  icon?: LucideIcon;
  className?: string;
}

const variantConfig: Record<
  StatusBadgeVariant,
  { classes: string; defaultIcon: LucideIcon }
> = {
  success: {
    classes:
      'bg-status-success-bg text-status-success-fg border-status-success-border',
    defaultIcon: CheckCircle2,
  },
  warning: {
    classes:
      'bg-status-warning-bg text-status-warning-fg border-status-warning-border',
    defaultIcon: AlertTriangle,
  },
  error: {
    classes:
      'bg-status-error-bg text-status-error-fg border-status-error-border',
    defaultIcon: XCircle,
  },
  info: {
    classes:
      'bg-status-info-bg text-status-info-fg border-status-info-border',
    defaultIcon: Info,
  },
};

/**
 * Accessible status badge enforcing icon + text label + border contrast
 * (NFR-05, NFR-07) so status is never conveyed by colour alone.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({
  variant,
  label,
  icon,
  className = '',
}) => {
  const { classes, defaultIcon } = variantConfig[variant];
  const Icon = icon ?? defaultIcon;

  return (
    <span className={`fs-badge ${classes} ${className}`.trim()}>
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
