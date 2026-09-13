import React from 'react';

/* Brand guide p45: ink is Graphite or white only. The accent is the ground,
   picked so the ink clears contrast, and the word carries the meaning. */

type Tone = 'positive' | 'caution' | 'negative' | 'neutral';

const tones: Record<Tone, React.CSSProperties> = {
  positive: { color: 'var(--status-positive-ink)', background: 'var(--status-positive)' },
  caution: { color: 'var(--status-caution-ink)', background: 'var(--status-caution)' },
  negative: { color: 'var(--status-negative-ink)', background: 'var(--status-negative)' },
  neutral: { color: 'var(--status-neutral-ink)', background: 'var(--status-neutral)' },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = 'neutral', children, style, ...rest }: BadgeProps) {
  return (
    <span
      style={{
        font: 'var(--type-caption)', fontWeight: 'var(--weight-medium)', ...tones[tone],
        padding: '3px 10px', borderRadius: 'var(--radius-pill)', display: 'inline-block',
        whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >{children}</span>
  );
}
