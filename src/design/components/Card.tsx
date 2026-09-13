import React from 'react';

/* A plain rounded container on the grouped background, for content that is
   not a list of rows. Same radius and same surface as a list section, so the
   two stack without looking like different systems. */

export interface CardProps extends React.HTMLAttributes<HTMLElement> {
  padding?: 'none' | 'compact' | 'regular' | 'roomy';
  /** Lifts the card off the page, for something that has just appeared. */
  raised?: boolean;
}

const PADDING = {
  none: 0,
  compact: 'var(--space-3)',
  regular: 'var(--space-4)',
  roomy: 'var(--space-5)',
} as const;

export function Card({ padding = 'regular', raised = false, children, style, ...rest }: CardProps) {
  return (
    <section
      style={{
        background: 'var(--bg-grouped-secondary)',
        borderRadius: 'var(--radius-card)',
        padding: PADDING[padding],
        boxShadow: raised ? '0 8px 30px rgba(0,0,0,0.12)' : 'none',
        ...style,
      }}
      {...rest}
    >{children}</section>
  );
}
