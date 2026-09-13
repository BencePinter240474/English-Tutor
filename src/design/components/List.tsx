import React from 'react';
import { Icon } from './Icon';

/* The inset grouped list, which is the backbone of an iOS screen.

   A section is a rounded card on the grouped background, with an optional
   header above it and a footer below. Rows inside are separated by hairlines
   that start where the row's text starts, never at the card edge, so the
   separator reads as dividing content rather than slicing the card. */

export interface ListSectionProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ListSection({ header, footer, children, style }: ListSectionProps) {
  const rows = React.Children.toArray(children).filter(Boolean);
  return (
    <section style={{ marginBottom: 'var(--space-7)', ...style }}>
      {header && (
        <div style={{
          font: 'var(--text-list-header)', color: 'var(--label-secondary)',
          textTransform: 'uppercase', letterSpacing: '0.06em',
          padding: '0 var(--space-4) var(--space-2)',
        }}>{header}</div>
      )}
      <div style={{
        background: 'var(--bg-grouped-secondary)',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
      }}>
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{
                height: 'var(--hairline)', background: 'var(--separator)',
                marginLeft: 'var(--space-4)',
              }} />
            )}
            {row}
          </React.Fragment>
        ))}
      </div>
      {footer && (
        <div style={{
          font: 'var(--text-footnote)', color: 'var(--label-secondary)',
          letterSpacing: 'var(--tracking-footnote)',
          padding: 'var(--space-2) var(--space-4) 0',
        }}>{footer}</div>
      )}
    </section>
  );
}

export interface ListRowProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small tinted square, the way Settings marks each row. */
  symbol?: React.ReactNode;
  symbolColor?: string;
  /** Grey text at the trailing edge, before any chevron. */
  value?: React.ReactNode;
  accessory?: 'chevron' | 'checkmark' | 'none';
  onClick?: () => void;
  destructive?: boolean;
  style?: React.CSSProperties;
}

export function ListRow({
  title, subtitle, symbol, symbolColor = 'var(--tint)', value,
  accessory = 'none', onClick, destructive = false, style,
}: ListRowProps) {
  const [pressed, setPressed] = React.useState(false);
  const interactive = onClick != null;
  const release = () => setPressed(false);

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (!interactive) return;
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick!(); }
      }}
      onPointerDown={() => interactive && setPressed(true)}
      onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
      style={{
        display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
        minHeight: 'var(--row-height)',
        padding: 'var(--space-3) var(--space-4)',
        cursor: interactive ? 'pointer' : 'default',
        // A pressed row fills, it does not scale: it is part of a card.
        background: pressed ? 'var(--fill-quaternary)' : 'transparent',
        transition: 'background-color var(--duration-instant) var(--ease-standard)',
        ...style,
      }}
    >
      {symbol && (
        <span style={{
          width: 29, height: 29, borderRadius: 7, flex: 'none',
          background: symbolColor, color: '#FFFFFF',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>{symbol}</span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{
          display: 'block', font: 'var(--text-body)',
          letterSpacing: 'var(--tracking-body)',
          color: destructive ? 'var(--red)' : 'var(--label)',
        }}>{title}</span>
        {subtitle && (
          <span style={{
            display: 'block', font: 'var(--text-footnote)',
            letterSpacing: 'var(--tracking-footnote)',
            color: 'var(--label-secondary)', marginTop: 1,
          }}>{subtitle}</span>
        )}
      </span>
      {value && (
        <span style={{
          font: 'var(--text-body)', letterSpacing: 'var(--tracking-body)',
          color: 'var(--label-secondary)', flex: 'none',
        }}>{value}</span>
      )}
      {accessory === 'chevron' && (
        <Icon name="chevron-right" size={14} weight={2.5} style={{ color: 'var(--label-tertiary)' }} />
      )}
      {accessory === 'checkmark' && (
        <Icon name="checkmark" size={16} weight={2.5} style={{ color: 'var(--tint)' }} />
      )}
    </div>
  );
}
