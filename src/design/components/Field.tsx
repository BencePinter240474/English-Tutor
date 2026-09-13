import React from 'react';

/* Label, hint and error wrapper, with a pale panel tone. An error is marked
   by a 3px Graphite keyline, not by coloured text. */

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  htmlFor?: string;
  tone?: 'plain' | 'pale';
}

export function Field({
  label, hint, error, required, htmlFor, tone = 'plain', children, style, ...rest
}: FieldProps) {
  const pale = tone === 'pale';
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 'var(--space-2)',
        background: pale ? 'var(--surface-pale)' : 'transparent',
        border: pale ? '1px solid var(--border-pale)' : 'none',
        borderRadius: pale ? 'var(--radius-lg)' : 0,
        padding: pale ? 'var(--space-4)' : 0, ...style,
      }}
      {...rest}
    >
      {label && (
        <label htmlFor={htmlFor} style={{ font: 'var(--type-caption)', fontWeight: 'var(--weight-medium)', color: 'var(--bark)' }}>
          {label}{required && <span style={{ color: 'var(--text-muted)' }}> (required)</span>}
        </label>
      )}
      {children}
      {error
        ? <p style={{ font: 'var(--type-caption)', color: 'var(--text-error)', borderLeft: 'var(--border-width-accent) solid var(--status-negative)', paddingLeft: 'var(--space-2)' }}>{error}</p>
        : hint ? <p style={{ font: 'var(--type-caption)', color: 'var(--text-muted)' }}>{hint}</p> : null}
    </div>
  );
}
