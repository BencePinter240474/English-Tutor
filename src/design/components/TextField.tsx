import React from 'react';

/* A text field on a fill, the shape iOS uses for search and for a single
   entry outside a grouped list. The border is the fill itself until focus,
   when the tint takes over. */

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export function TextField({ invalid, disabled, style, ...rest }: TextFieldProps) {
  const [focus, setFocus] = React.useState(false);
  const ring = invalid ? 'var(--red)' : focus ? 'var(--tint)' : 'transparent';
  return (
    <input
      disabled={disabled}
      onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        width: '100%', minHeight: 'var(--tap-target)',
        padding: '11px 14px',
        font: 'var(--text-body)', letterSpacing: 'var(--tracking-body)',
        color: 'var(--label)',
        background: 'var(--fill-tertiary)',
        border: '1.5px solid ' + ring,
        borderRadius: 'var(--radius-control)',
        outline: 'none', boxShadow: 'none',
        opacity: disabled ? 0.4 : 1,
        transition: 'border-color var(--duration-fast) var(--ease-standard)',
        ...style,
      }}
      {...rest}
    />
  );
}
