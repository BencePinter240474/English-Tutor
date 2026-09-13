import React from 'react';

/* elho Button. Leaf primary, secondary, ghost, three sizes.

   Diverges from the elho source in one detail: the source mixes the border
   shorthand with borderColor, which React warns about and which drops the
   border on some state changes. Every state here sets the shorthand.
   Ink stays Graphite or white (p45), so a secondary or ghost button carries
   its affordance through ground and border, never through coloured type. */

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

const base: React.CSSProperties = {
  font: 'var(--weight-medium) var(--size-body)/1 var(--font-core)',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)',
  borderRadius: 'var(--radius-sm)', border: '1px solid transparent', cursor: 'pointer',
  transition: 'var(--transition-ui)', textDecoration: 'none', whiteSpace: 'nowrap',
};
const sizes: Record<Size, React.CSSProperties> = {
  sm: { padding: '8px 12px', fontSize: 'var(--size-small)' },
  md: { padding: '11px 18px', fontSize: 'var(--size-body)' },
  lg: { padding: '14px 24px', fontSize: 'var(--size-body)' },
};
const variants: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--fill-action)', color: 'var(--fill-action-ink)' },
  secondary: { background: 'var(--white)', color: 'var(--graphite)', border: '1px solid var(--border-strong)' },
  ghost: { background: 'transparent', color: 'var(--graphite)' },
};
// Hover and press darken to Graphite: the palette has no tint ramps.
const hovers: Record<Variant, React.CSSProperties> = {
  primary: { background: 'var(--fill-action-hover)' },
  secondary: { background: 'var(--linen)', border: '1px solid var(--graphite)' },
  ghost: { background: 'var(--linen)' },
};

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'primary', size = 'md', disabled, iconLeft, iconRight,
  type = 'button', children, style, ...rest
}: ButtonProps) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  const disabledStyle: React.CSSProperties = {
    background: 'var(--linen)', color: 'var(--bark)', border: '1px solid var(--pebble)', cursor: 'not-allowed',
  };
  const s: React.CSSProperties = {
    ...base, ...sizes[size], ...variants[variant],
    ...(hover && !disabled ? hovers[variant] : null),
    ...(press && !disabled ? { transform: 'translateY(1px)', background: 'var(--graphite)', color: 'var(--white)' } : null),
    ...(disabled ? disabledStyle : null), ...style,
  };
  return (
    <button
      type={type} disabled={disabled} style={s}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)}
      onMouseUp={() => setPress(false)}
      {...rest}
    >
      {iconLeft}{children}{iconRight}
    </button>
  );
}
