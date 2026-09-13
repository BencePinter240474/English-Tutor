import React from 'react';

/* Apple's four button styles.

   filled    the one primary action on a screen, tint ground, white ink
   tinted    a secondary action, 15% tint ground, tint ink
   gray      neutral, a system fill ground
   plain     text only, for anything that must not compete

   Press is the signature: the control dips to 96% and returns on a spring.
   That happens on pointerdown, not on click, so it tracks the finger. */

type Variant = 'filled' | 'tinted' | 'gray' | 'plain';
type Size = 'small' | 'medium' | 'large';

const SIZES: Record<Size, React.CSSProperties> = {
  small: { padding: '7px 14px', font: 'var(--text-subheadline)', fontWeight: 600, borderRadius: 'var(--radius-small)', minHeight: 34 },
  medium: { padding: '10px 18px', font: 'var(--text-callout)', fontWeight: 600, borderRadius: 'var(--radius-control)', minHeight: 44 },
  large: { padding: '15px 22px', font: 'var(--text-body)', fontWeight: 600, borderRadius: 'var(--radius-control)', minHeight: 50 },
};

function palette(variant: Variant, destructive: boolean): React.CSSProperties {
  const accent = destructive ? 'var(--red)' : 'var(--tint)';
  switch (variant) {
    case 'filled':
      return { background: accent, color: '#FFFFFF' };
    case 'tinted':
      return { background: `color-mix(in srgb, ${accent} 15%, transparent)`, color: accent };
    case 'gray':
      return { background: 'var(--fill-tertiary)', color: 'var(--label)' };
    case 'plain':
      return { background: 'transparent', color: accent };
  }
}

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type'> {
  variant?: Variant;
  size?: Size;
  /** Red ink or ground, for anything that removes something. */
  destructive?: boolean;
  /** Stretches to the width of its container, as a sheet's main action does. */
  block?: boolean;
  icon?: React.ReactNode;
  iconTrailing?: React.ReactNode;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  variant = 'filled', size = 'medium', destructive = false, block = false,
  icon, iconTrailing, disabled, type = 'button', children, style, ...rest
}: ButtonProps) {
  const [pressed, setPressed] = React.useState(false);
  const release = () => setPressed(false);

  return (
    <button
      type={type} disabled={disabled}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
      onBlur={release}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--space-2)', width: block ? '100%' : undefined,
        border: 'none', cursor: disabled ? 'default' : 'pointer',
        letterSpacing: 'var(--tracking-body)', textAlign: 'center',
        transition: 'var(--transition-control)',
        transform: pressed ? 'scale(0.96)' : 'scale(1)',
        opacity: disabled ? 0.4 : 1,
        ...SIZES[size], ...palette(variant, destructive), ...style,
      }}
      {...rest}
    >
      {icon}{children}{iconTrailing}
    </button>
  );
}
