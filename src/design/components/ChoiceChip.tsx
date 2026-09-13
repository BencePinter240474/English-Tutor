import React from 'react';

/* Toggling button: Linen unselected, Leaf selected with white ink, which
   reads as an action rather than a record. Press nudges 1px down. */

type ChipBaseProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onToggle'>;

export interface ChoiceChipProps extends ChipBaseProps {
  selected?: boolean;
  onToggle?: (next: boolean) => void;
}

export function ChoiceChip({ children, selected = false, disabled = false, onToggle, style, ...rest }: ChoiceChipProps) {
  const [hover, setHover] = React.useState(false);
  const [press, setPress] = React.useState(false);
  let bg: string, fg: string, bc: string;
  if (disabled) {
    bg = 'var(--linen)'; fg = 'var(--bark)'; bc = 'var(--border-strong)';
  } else if (selected) {
    bg = press || hover ? 'var(--graphite)' : 'var(--leaf)';
    fg = 'var(--white)'; bc = 'transparent';
  } else {
    bg = press ? 'var(--pebble)' : hover ? 'var(--lime)' : 'var(--surface-pale)';
    fg = 'var(--graphite)'; bc = 'var(--border-pale)';
  }
  return (
    <button
      type="button" role="checkbox" aria-checked={selected} disabled={disabled}
      onClick={() => onToggle && onToggle(!selected)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onMouseDown={() => setPress(true)} onMouseUp={() => setPress(false)}
      style={{
        font: (selected ? 500 : 400) + ' var(--size-body)/1.2 var(--font-core)',
        color: fg, background: bg, border: '1px solid ' + bc,
        borderRadius: 'var(--radius-lg)', padding: '13px 18px', minHeight: 44,
        cursor: disabled ? 'default' : 'pointer', transition: 'var(--transition-ui)',
        transform: press && !disabled ? 'translateY(1px)' : 'none', textAlign: 'left', ...style,
      }}
      {...rest}
    >{children}</button>
  );
}
