import type { ReactNode } from 'react';
import { Badge, Button, Card, ProgressBar } from '../design/components';

/* The end of a round. The score is the biggest thing on the screen, the
   verdict is a tinted capsule next to it, and the ring of the progress bar
   repeats the same number so it reads at a glance. */

interface Props {
  score: number;
  total: number;
  onRestart: () => void;
  restartLabel?: string;
  secondaryLabel?: string;
  onSecondary?: () => void;
  children?: ReactNode;
}

export function ScoreSummary({
  score, total, onRestart, restartLabel = 'Go again',
  secondaryLabel, onSecondary, children,
}: Props) {
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const verdict = pct >= 80 ? 'Strong' : pct >= 50 ? 'Getting there' : 'Keep at it';
  const tone = pct >= 80 ? 'positive' : pct >= 50 ? 'info' : 'neutral';
  const tint = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--blue)' : 'var(--orange)';

  return (
    <Card padding="roomy" raised>
      <div style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-footnote)' }}>
        Round finished
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', margin: '2px 0 var(--space-4)', flexWrap: 'wrap' }}>
        <span style={{
          font: 'var(--text-large-title)', letterSpacing: 'var(--tracking-large-title)',
          fontVariantNumeric: 'tabular-nums', color: 'var(--label)',
        }}>{score} of {total}</span>
        <Badge tone={tone}>{verdict}</Badge>
      </div>
      <ProgressBar value={score} max={total} tint={tint} />
      <div style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', marginTop: 'var(--space-2)', letterSpacing: 'var(--tracking-footnote)' }}>
        {pct}% correct
      </div>
      {children && <div style={{ marginTop: 'var(--space-5)' }}>{children}</div>}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
        <Button onClick={onRestart}>{restartLabel}</Button>
        {secondaryLabel && onSecondary && (
          <Button variant="gray" onClick={onSecondary}>{secondaryLabel}</Button>
        )}
      </div>
    </Card>
  );
}
