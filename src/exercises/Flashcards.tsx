import React from 'react';
import { Badge, Button, ProgressBar, SegmentedControl } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { ScoreSummary } from '../components/ScoreSummary';
import { Screen } from '../components/Screen';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import { shuffle } from '../lib/shuffle';
import type { VocabItem } from '../lib/types';

/* Flashcards.

   Hungarian on the front, English on the back, or the other way round. A card
   the learner did not know goes back to the end of the queue, so a round is
   only finished when every card has been recalled once. The score counts
   cards known first time, which is the honest measure.

   The card turns over in three dimensions on a spring. Both faces are always
   in the DOM, rotated apart and hidden from the back, so the text is present
   for a screen reader and the turn costs nothing to animate. */

const ROUND_SIZES = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '40', label: '40' },
  { value: '0', label: 'All' },
];

export function Flashcards() {
  const { vocab } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => vocab.map(p => p.id));
  const [direction, setDirection] = React.useState('hu-en');
  const [roundSize, setRoundSize] = React.useState('20');

  const [queue, setQueue] = React.useState<VocabItem[] | null>(null);
  const [flipped, setFlipped] = React.useState(false);
  const [missed, setMissed] = React.useState<Set<string>>(new Set());
  const [roundTotal, setRoundTotal] = React.useState(0);
  const [finished, setFinished] = React.useState(false);

  // A newly uploaded pack joins the selection instead of sitting there unused.
  React.useEffect(() => {
    setSelectedPacks(prev => {
      const known = new Set(prev);
      const added = vocab.filter(p => !known.has(p.id)).map(p => p.id);
      return added.length ? [...prev, ...added] : prev;
    });
  }, [vocab]);

  const pool = React.useMemo(
    () => vocab.filter(p => selectedPacks.includes(p.id)).flatMap(p => p.items),
    [vocab, selectedPacks],
  );

  const start = React.useCallback(() => {
    const size = Number(roundSize);
    const round = size > 0 ? shuffle(pool).slice(0, size) : shuffle(pool);
    setQueue(round);
    setRoundTotal(round.length);
    setMissed(new Set());
    setFlipped(false);
    setFinished(false);
  }, [pool, roundSize]);

  const answer = React.useCallback((knew: boolean) => {
    if (!queue || queue.length === 0) return;
    const card = queue[0];
    const rest = queue.slice(1);
    setFlipped(false);
    if (!knew) {
      setMissed(m => new Set(m).add(card.id));
      setQueue([...rest, card]);
      return;
    }
    setQueue(rest);
    if (rest.length === 0) {
      recordRun('flashcards', roundTotal - missed.size, roundTotal);
      setFinished(true);
    }
  }, [queue, missed, roundTotal]);

  // Space turns the card, then Enter or the right arrow keeps it and the
  // left arrow sends it back into the queue.
  React.useEffect(() => {
    if (!queue || finished) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); setFlipped(f => !f); return; }
      if (!flipped) return;
      if (e.key === 'Enter' || e.key === 'ArrowRight') { e.preventDefault(); answer(true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); answer(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [queue, flipped, finished, answer]);

  const card = queue?.[0];
  const huFirst = direction === 'hu-en';
  const front = card ? (huFirst ? card.hungarian : card.english) : '';
  const back = card ? (huFirst ? card.english : card.hungarian) : '';
  const done = roundTotal - (queue?.length ?? 0);

  const face: React.CSSProperties = {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)',
    padding: 'var(--space-6)', textAlign: 'center',
    borderRadius: 'var(--radius-large)',
    backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
  };

  return (
    <Screen
      title="Flashcards"
      backTo="/"
      backLabel="Practise"
      trailing={queue && !finished
        ? <Button variant="plain" size="small" onClick={() => setQueue(null)}>End</Button>
        : undefined}
    >
      {!queue && (
        <>
          <PackPicker
            packs={vocab} selected={selectedPacks} onChange={setSelectedPacks}
            itemNoun="words"
          />

          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ font: 'var(--text-list-header)', color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 var(--space-4) var(--space-2)' }}>
              Direction
            </div>
            <SegmentedControl
              segments={[
                { value: 'hu-en', label: 'Hungarian first' },
                { value: 'en-hu', label: 'English first' },
              ]}
              value={direction} onChange={setDirection}
            />
          </div>

          <div style={{ marginBottom: 'var(--space-7)' }}>
            <div style={{ font: 'var(--text-list-header)', color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 var(--space-4) var(--space-2)' }}>
              Cards in this round
            </div>
            <SegmentedControl segments={ROUND_SIZES} value={roundSize} onChange={setRoundSize} />
          </div>

          <Button block size="large" onClick={start} disabled={pool.length === 0}>
            Start round
          </Button>
          {pool.length === 0 && (
            <p style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
              Choose at least one pack, or add a CSV below.
            </p>
          )}

          <div style={{ marginTop: 'var(--space-7)' }}>
            <CsvUpload kind="vocab" label="Add your own words" />
          </div>
        </>
      )}

      {queue && !finished && card && (
        <>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              font: 'var(--text-footnote)', color: 'var(--label-secondary)',
              letterSpacing: 'var(--tracking-footnote)', marginBottom: 6,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span>Card {done + 1} of {roundTotal}</span>
              <span>{queue.length} left</span>
            </div>
            <ProgressBar value={done} max={roundTotal} />
          </div>

          <button
            type="button"
            onClick={() => setFlipped(f => !f)}
            aria-label={flipped ? 'Turn the card back' : 'Turn the card over'}
            style={{
              width: '100%', border: 'none', background: 'none', padding: 0,
              cursor: 'pointer', perspective: 1200, display: 'block',
            }}
          >
            <div style={{
              position: 'relative', width: '100%', minHeight: 300,
              transformStyle: 'preserve-3d',
              transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              transition: 'transform var(--duration-slow) var(--ease-spring)',
            }}>
              <div style={{ ...face, background: 'var(--bg-grouped-secondary)' }}>
                <span style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {huFirst ? 'Hungarian' : 'English'}
                </span>
                <span style={{ font: 'var(--text-title-1)', letterSpacing: 'var(--tracking-title-1)', color: 'var(--label)' }}>
                  {front}
                </span>
                <span style={{ font: 'var(--text-footnote)', color: 'var(--label-tertiary)', marginTop: 'var(--space-2)' }}>
                  Tap the card, or press space
                </span>
              </div>
              <div style={{
                ...face, background: 'var(--tint)', color: '#FFFFFF',
                transform: 'rotateY(180deg)',
              }}>
                <span style={{ font: 'var(--text-footnote)', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {huFirst ? 'English' : 'Hungarian'}
                </span>
                <span style={{ font: 'var(--text-title-1)', letterSpacing: 'var(--tracking-title-1)' }}>
                  {back}
                </span>
                {card.example && (
                  <span style={{ font: 'var(--text-subheadline)', opacity: 0.85, maxWidth: '32ch', letterSpacing: 'var(--tracking-subheadline)' }}>
                    {card.example}
                  </span>
                )}
              </div>
            </div>
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
            <Button variant="gray" size="large" style={{ flex: 1 }} onClick={() => answer(false)} disabled={!flipped}>
              Practise again
            </Button>
            <Button size="large" style={{ flex: 1 }} onClick={() => answer(true)} disabled={!flipped}>
              I knew it
            </Button>
          </div>
          {card.category && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <Badge tone="neutral">{card.category}</Badge>
            </div>
          )}
        </>
      )}

      {finished && (
        <ScoreSummary
          score={roundTotal - missed.size}
          total={roundTotal}
          onRestart={start}
          restartLabel="New round"
          secondaryLabel="Change packs"
          onSecondary={() => setQueue(null)}
        >
          <p style={{ font: 'var(--text-subheadline)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-subheadline)' }}>
            {missed.size === 0
              ? 'Every card was known first time.'
              : missed.size + (missed.size === 1 ? ' card needed' : ' cards needed') + ' a second look, and each one came back until you got it.'}
          </p>
        </ScoreSummary>
      )}
    </Screen>
  );
}
