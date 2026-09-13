import React from 'react';
import { Icon } from './Icon';

/* The navigation bar.

   Two states, as on iOS. At the root of a tab the title is large and sits
   below the bar in the content. Pushed one level in, the title is inline and
   a back button appears at the leading edge.

   The bar is a material, not a colour: it blurs and saturates whatever
   scrolls under it, which is why it stays legible over a white card and over
   a dark passage of text alike. It spans the full window while its contents
   line up with the content column, so a wide window reads as an app rather
   than as a stretched phone screen. */

const COLUMN: React.CSSProperties = {
  width: '100%', maxWidth: 'var(--content-width)', margin: '0 auto',
};

export interface NavigationBarProps {
  title: string;
  large?: boolean;
  onBack?: () => void;
  backLabel?: string;
  trailing?: React.ReactNode;
}

export function NavigationBar({ title, large = false, onBack, backLabel = 'Back', trailing }: NavigationBarProps) {
  return (
    <>
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--material-bar)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        borderBottom: 'var(--hairline) solid var(--separator)',
      }}>
        <div style={{
          ...COLUMN, minHeight: 'var(--bar-height)',
          display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          padding: '0 var(--space-3)',
        }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}>
            {onBack && (
              <button
                type="button" onClick={onBack}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 2,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--tint)', font: 'var(--text-body)',
                  letterSpacing: 'var(--tracking-body)', padding: '6px 4px',
                }}
              >
                <Icon name="chevron-left" size={17} weight={2.5} />
                {backLabel}
              </button>
            )}
          </div>
          {!large && (
            <div style={{
              font: 'var(--text-headline)', letterSpacing: 'var(--tracking-headline)',
              color: 'var(--label)', whiteSpace: 'nowrap', overflow: 'hidden',
              textOverflow: 'ellipsis', maxWidth: '55%',
            }}>{title}</div>
          )}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 'var(--space-2)' }}>
            {trailing}
          </div>
        </div>
      </div>
      {large && (
        <div style={COLUMN}>
          <h1 style={{
            font: 'var(--text-large-title)', letterSpacing: 'var(--tracking-large-title)',
            color: 'var(--label)',
            padding: 'var(--space-4) var(--screen-inset) var(--space-2)',
          }}>{title}</h1>
        </div>
      )}
    </>
  );
}
