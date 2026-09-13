/* A thin capsule track, the shape iOS uses for determinate progress. */

export interface ProgressBarProps {
  value: number;
  max: number;
  tint?: string;
}

export function ProgressBar({ value, max, tint = 'var(--tint)' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}
      style={{
        height: 4, borderRadius: 'var(--radius-capsule)',
        background: 'var(--fill-tertiary)', overflow: 'hidden',
      }}
    >
      <div style={{
        width: pct + '%', height: '100%', background: tint,
        borderRadius: 'var(--radius-capsule)',
        transition: 'width var(--duration-base) var(--ease-out)',
      }} />
    </div>
  );
}
