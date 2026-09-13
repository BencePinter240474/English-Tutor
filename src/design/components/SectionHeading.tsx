import React from 'react';

/* Graphite heading with the 2px Leaf rule and a one-sentence takeaway.
   A section is delimited by a rule, never by a tinted box. */

export interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 1 | 2 | 3;
  eyebrow?: React.ReactNode;
  note?: React.ReactNode;
}

export function SectionHeading({ level = 2, eyebrow, children, note, id, style, ...rest }: SectionHeadingProps) {
  const Tag = ('h' + level) as 'h1' | 'h2' | 'h3';
  const font = level === 1 ? 'var(--type-h1)' : level === 2 ? 'var(--type-h2)' : 'var(--type-h3)';
  return (
    <div
      id={id} data-block="section-heading"
      style={{
        borderTop: level <= 2 ? 'var(--border-width-rule) solid var(--rule-heading)' : 'none',
        paddingTop: level <= 2 ? 'var(--space-3)' : 0, marginBottom: 'var(--space-2)', ...style,
      }}
      {...rest}
    >
      {eyebrow && (
        <div style={{ font: 'var(--type-eyebrow)', letterSpacing: 'var(--tracking-none)', color: 'var(--text-muted)', marginBottom: 'var(--space-2)' }}>{eyebrow}</div>
      )}
      <Tag style={{ font, color: 'var(--text-heading)', letterSpacing: level === 1 ? 'var(--tracking-xl)' : 'var(--tracking-lg)' }}>{children}</Tag>
      {note && <p style={{ font: 'var(--type-small)', color: 'var(--text-muted)', marginTop: 'var(--space-2)', maxWidth: 'var(--measure-prose)' }}>{note}</p>}
    </div>
  );
}
