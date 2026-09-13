import React from 'react';

/* Native dropdown for scope controls. */

export interface SelectOption { value: string; label: string }

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options?: SelectOption[];
  invalid?: boolean;
}

export function Select({ options = [], invalid, disabled, style, ...rest }: SelectProps) {
  const [focus, setFocus] = React.useState(false);
  return (
    <select
      disabled={disabled} onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
      style={{
        font: 'var(--type-small)', color: disabled ? 'var(--bark)' : 'var(--text-body)',
        background: disabled ? 'var(--linen)' : 'var(--white)',
        border: '1px solid ' + (invalid ? 'var(--status-negative)' : focus ? 'var(--leaf)' : 'var(--border-strong)'),
        borderRadius: 'var(--radius-sm)', padding: '9px 10px', width: '100%', boxSizing: 'border-box',
        boxShadow: focus ? 'var(--focus-ring)' : 'none', outline: 'none',
        transition: 'var(--transition-ui)', ...style,
      }}
      {...rest}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
