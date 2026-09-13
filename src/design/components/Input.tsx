import React from 'react';

/* Text or numeric entry resting on Linen. Focus moves the ground to Lime and
   the border to Leaf. 9px corner, because an input is a control. */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  iconLeft?: React.ReactNode;
}

export function Input({ invalid, disabled, iconLeft, style, ...rest }: InputProps) {
  const [focus, setFocus] = React.useState(false);
  const [hover, setHover] = React.useState(false);
  const bg = disabled ? 'var(--linen)' : invalid ? 'var(--status-negative-bg)'
    : focus ? 'var(--surface-field-focus)' : 'var(--surface-field)';
  const bc = disabled ? 'var(--border-strong)' : invalid ? 'var(--status-negative)'
    : focus ? 'var(--leaf)' : hover ? 'var(--pebble)' : 'var(--border-pale)';
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {iconLeft && <span style={{ position: 'absolute', left: 12, color: 'var(--bark)', display: 'inline-flex' }}>{iconLeft}</span>}
      <input
        disabled={disabled}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          font: 'var(--type-small)', width: '100%', boxSizing: 'border-box',
          padding: '11px 12px', paddingLeft: iconLeft ? 38 : 12,
          borderRadius: 'var(--radius-lg)', border: '1px solid ' + bc, background: bg,
          color: disabled ? 'var(--bark)' : 'var(--text-body)',
          boxShadow: focus ? 'var(--focus-ring)' : 'none',
          transition: 'var(--transition-ui)', outline: 'none', ...style,
        }}
        {...rest}
      />
    </div>
  );
}
