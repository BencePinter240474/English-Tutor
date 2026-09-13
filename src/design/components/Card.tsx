import React from 'react';

/* Square. A card is a container, so it gets edges and rules, not a rounded
   shadowed box. Only a selectable row reads as a control and takes the 9px
   corner. Internal mode has no elevation: --shadow-card resolves to none. */

const Check = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

export interface CardProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  footnote?: React.ReactNode;
  tone?: 'plain' | 'pale' | 'sunken';
  selected?: boolean;
  selectable?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export function Card({
  title, eyebrow, actions, footnote, tone = 'plain', selected = false,
  selectable = false, padding = 'md', children, style, ...rest
}: CardProps) {
  const pad = padding === 'sm' ? 'var(--space-4)' : padding === 'lg' ? 'var(--space-6)' : 'var(--space-5)';
  const bg = selected ? 'var(--fill-emphasis)'
    : tone === 'pale' ? 'var(--surface-pale)'
    : tone === 'sunken' ? 'var(--surface-sunken)' : 'var(--surface-card)';
  const bc = selected ? 'var(--fill-emphasis)' : tone === 'pale' ? 'var(--border-pale)' : 'var(--border-hairline)';
  return (
    <section
      aria-selected={selected || undefined}
      style={{
        background: bg, border: '1px solid ' + bc,
        borderRadius: selectable || selected ? 'var(--radius-lg)' : 'var(--radius-none)',
        boxShadow: 'var(--shadow-none)',
        color: selected ? 'var(--fill-emphasis-ink)' : 'var(--text-body)', padding: pad, ...style,
      }}
      {...rest}
    >
      {(eyebrow || title || actions || selected) && (
        <header style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: children ? 'var(--space-3)' : 0 }}>
          <div style={{ flex: 1 }}>
            {eyebrow && <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-none)', color: selected ? 'var(--fill-emphasis-ink)' : 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{eyebrow}</div>}
            {title && <h3 style={{ font: 'var(--type-h3)', color: selected ? 'var(--fill-emphasis-ink)' : 'var(--text-heading)' }}>{title}</h3>}
          </div>
          {actions}
          {selected && (
            <span style={{
              flex: 'none', width: 26, height: 26, borderRadius: 'var(--radius-pill)',
              background: 'var(--graphite)', color: 'var(--white)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}><Check /></span>
          )}
        </header>
      )}
      {children && <div>{children}</div>}
      {footnote && (
        <p style={{
          font: 'var(--type-caption)', color: selected ? 'var(--fill-emphasis-ink)' : 'var(--text-muted)',
          marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)',
          borderTop: '1px solid ' + (selected ? 'var(--graphite)' : 'var(--border-hairline)'),
        }}>{footnote}</p>
      )}
    </section>
  );
}
