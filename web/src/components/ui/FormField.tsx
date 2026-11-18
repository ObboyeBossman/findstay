import React from 'react';
import { AlertCircle } from 'lucide-react';

interface InlineErrorProps {
  id: string;
  message?: string;
}

/**
 * Accessible inline form error pairing an alert icon with plain-language fix
 * instructions (S1-03-T5, NFR-07).
 */
export const InlineError: React.FC<InlineErrorProps> = ({ id, message }) => {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1 flex items-start gap-1.5 text-caption font-medium text-status-error-fg"
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
};

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
}

/**
 * Accessible labelled input with 44px minimum touch height, aria-invalid,
 * and linked hint/error descriptions (S1-03-T5, NFR-09).
 */
export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  hint,
  error,
  className = '',
  required,
  ...inputProps
}) => {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="w-full">
      <label
        htmlFor={id}
        className="mb-1 block text-caption font-semibold text-earth"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-terracotta-dark" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy}
        className={`min-h-touch w-full rounded-lg border bg-surface-card px-3 py-2 text-body-2 text-earth placeholder:text-earth/50 focus:outline-none ${
          error
            ? 'border-status-error-border bg-status-error-bg/40'
            : 'border-border-subtle focus:border-olive'
        } ${className}`.trim()}
        {...inputProps}
      />
      {hint && !error ? (
        <p id={hintId} className="mt-1 text-caption text-earth/75">
          {hint}
        </p>
      ) : null}
      <InlineError id={`${id}-error`} message={error} />
    </div>
  );
};
