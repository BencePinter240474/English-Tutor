import React from 'react';

/* Square category or filter label with a 4px Pebble marker. */

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement> {
  onRemove?: () => void;
}

export function Tag({ children, onRemove, style, ...rest }: TagProps) {
  return (
    <span
      style={{
        font: 'var(--type-caption)', color: 'var(--bark)', background: 'var(--white)',
        border: '1px solid var(--border-hairline)', borderRadius: 'var(--radius-sm)',
        padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', ...style,
      }}
      {...rest}
    >
      <span style={{ width: 4, height: 4, background: 'var(--pebble)', flex: 'none' }} />
      {children}
      {onRemove && (
        <button
          type="button" onClick={onRemove} aria-label="Remove"
          style={{
            border: 0, background: 'none', color: 'var(--bark)', cursor: 'pointer',
            font: 'var(--type-caption)', padding: 0, lineHeight: 1,
          }}
        >x</button>
      )}
    </span>
  );
}
