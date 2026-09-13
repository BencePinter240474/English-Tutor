import React from 'react';

/* Switches views of the same data. Linen active ground with a 2px Leaf rule. */

export interface TabItem {
  value: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  count?: number | null;
}

type TabsBaseProps = Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>;

export interface TabsProps extends TabsBaseProps {
  tabs?: TabItem[];
  value?: string;
  onChange?: (value: string) => void;
}

export function Tabs({ tabs = [], value, onChange, style, ...rest }: TabsProps) {
  return (
    <div role="tablist" style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border-hairline)', flexWrap: 'wrap', ...style }} {...rest}>
      {tabs.map(t => {
        const active = value === t.value;
        return (
          <button
            key={t.value} type="button" role="tab" aria-selected={active}
            onClick={() => onChange && onChange(t.value)}
            style={{
              font: 'var(--weight-medium) var(--size-body)/1 var(--font-core)',
              color: active ? 'var(--text-heading)' : 'var(--bark)',
              background: active ? 'var(--linen)' : 'transparent',
              border: 0, borderBottom: 'var(--border-width-rule) solid ' + (active ? 'var(--leaf)' : 'transparent'),
              padding: '11px 16px', cursor: 'pointer', transition: 'var(--transition-ui)',
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: -1,
            }}
          >
            {t.icon}{t.label}
            {t.count != null && <span style={{ font: 'var(--type-caption)', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{t.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
