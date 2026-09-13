import React from 'react';
import { Badge, Icon, ListRow, ListSection, ProgressBar } from '../design/components';
import { Screen } from '../components/Screen';
import { clearStats, loadStats } from '../lib/storage';

/* The Progress tab: what has actually been done.

   One section per exercise that has been run, showing the last round and the
   best ratio so far. Rounds differ in length, so the best is stored as a
   ratio rather than a raw score and shown as a percentage. */

const TITLES: Record<string, { label: string; icon: string; colour: string }> = {
  flashcards: { label: 'Flashcards', icon: 'cards', colour: 'var(--blue)' },
  matching: { label: 'Matching pairs', icon: 'grid', colour: 'var(--purple)' },
  grammar: { label: 'Grammar', icon: 'text', colour: 'var(--orange)' },
  reading: { label: 'Reading', icon: 'book', colour: 'var(--green)' },
};

export function Progress() {
  const [stats, setStats] = React.useState(() => loadStats());
  const entries = Object.entries(stats);

  if (entries.length === 0) {
    return (
      <Screen title="Progress" large>
        <div style={{ textAlign: 'center', padding: 'var(--space-9) var(--space-4)' }}>
          <Icon name="chart" size={48} weight={1.6} style={{ color: 'var(--label-tertiary)', margin: '0 auto var(--space-4)' }} />
          <h2 style={{ font: 'var(--text-title-3)', letterSpacing: 'var(--tracking-title-3)', marginBottom: 6 }}>
            No rounds yet
          </h2>
          <p style={{ font: 'var(--text-subheadline)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-subheadline)' }}>
            Finish an exercise and your scores will show up here.
          </p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Progress" large>
      {entries.map(([key, stat]) => {
        const meta = TITLES[key] ?? { label: key, icon: 'chart', colour: 'var(--gray)' };
        const bestPct = stat.bestRatio != null ? Math.round(stat.bestRatio * 100) : null;
        return (
          <ListSection key={key} header={meta.label}>
            <ListRow
              title="Rounds finished"
              symbol={<Icon name={meta.icon} size={17} weight={2} />}
              symbolColor={meta.colour}
              value={String(stat.runs)}
            />
            {stat.lastScore != null && stat.lastTotal != null && (
              <ListRow
                title="Last round"
                value={stat.lastScore + ' of ' + stat.lastTotal}
                subtitle={stat.lastAt ? new Date(stat.lastAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }) : undefined}
              />
            )}
            {bestPct != null && (
              <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <span style={{ font: 'var(--text-body)', letterSpacing: 'var(--tracking-body)' }}>Best so far</span>
                  <Badge tone={bestPct >= 80 ? 'positive' : bestPct >= 50 ? 'info' : 'neutral'}>{bestPct}%</Badge>
                </div>
                <ProgressBar
                  value={bestPct} max={100}
                  tint={bestPct >= 80 ? 'var(--green)' : bestPct >= 50 ? 'var(--blue)' : 'var(--orange)'}
                />
              </div>
            )}
          </ListSection>
        );
      })}

      <ListSection footer="Scores are kept in this browser and are never sent anywhere.">
        <ListRow
          title="Clear progress"
          destructive
          onClick={() => setStats(clearStats())}
        />
      </ListSection>
    </Screen>
  );
}
