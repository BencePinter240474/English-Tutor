import React from 'react';

/* A small status marker. Apple leans on colour here more than on shape, so
   a badge is a tinted capsule with the system colour that matches the
   meaning: green for a pass, red for a miss, grey for neutral. */

type Tone = 'positive' | 'negative' | 'neutral' | 'info';

const TONES: Record<Tone, { fill: string; ink: string }> = {
  positive: { fill: 'var(--green)', ink: 'var(--green)' },
  negative: { fill: 'var(--red)', ink: 'var(--red)' },
  neutral: { fill: 'var(--gray)', ink: 'var(--label-secondary)' },
  info: { fill: 'var(--blue)', ink: 'var(--blue)' },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  /** Solid fills the capsule with the colour and uses white ink. */
  solid?: boolean;
}

export function Badge({ tone = 'neutral', solid = false, children, style, ...rest }: BadgeProps) {
  const { fill, ink } = TONES[tone];
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        padding: '3px 9px', borderRadius: 'var(--radius-capsule)',
        font: 'var(--text-caption-1)', fontWeight: 600,
        background: solid ? fill : `color-mix(in srgb, ${fill} 15%, transparent)`,
        color: solid ? '#FFFFFF' : ink,
        whiteSpace: 'nowrap', ...style,
      }}
      {...rest}
    >{children}</span>
  );
}
