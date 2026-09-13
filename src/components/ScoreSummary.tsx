import type { ReactNode } from 'react';
import { Badge, Button, Card } from '../design/components';

/* The end of a round. A stat is pulled out at 56px, and the verdict is a
   word in a badge rather than a colour, because ink is Graphite or white. */

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
  restartLabel?: string;
  children?: ReactNode;
}

export function ScoreSummary({ score, total, onRestart, restartLabel = 'Go again', children }: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const verdict = pct >= 80 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Needs another look';
  const tone = pct >= 80 ? 'positive' : pct >= 50 ? 'neutral' : 'caution';
  return (
    <Card padding="lg">
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
        <div>
          <div style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>
            Round finished
          </div>
          <div style={{
            font: 'var(--weight-medium) var(--size-h3)/var(--leading-tight) var(--font-core)',
            letterSpacing: 'var(--tracking-lg)', fontVariantNumeric: 'tabular-nums',
          }}>
            {score} of {total}
          </div>
        </div>
        <div style={{ paddingBottom: 6 }}>
          <Badge tone={tone}>{verdict}</Badge>
          <span style={{ font: 'var(--type-caption)', color: 'var(--bark)', marginLeft: 'var(--space-3)' }}>
            {pct}% correct
          </span>
        </div>
      </div>
      {children && <div style={{ marginTop: 'var(--space-5)' }}>{children}</div>}
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Button onClick={onRestart}>{restartLabel}</Button>
      </div>
    </Card>
  );
}
