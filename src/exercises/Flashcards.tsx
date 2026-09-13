import React from 'react';
import { Badge, Button, ChoiceChip, SectionHeading } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { ScoreSummary } from '../components/ScoreSummary';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import { shuffle } from '../lib/shuffle';
import type { VocabItem } from '../lib/types';

/* Flashcards.

   Hungarian on the front, English on the back, or the other way round. A card
   the learner did not know goes back to the end of the queue, so a round is
   only finished when every card has been recalled once. The score counts
   cards known first time, which is the honest measure.

   There is no 3D flip. elho motion allows fades and height reveals only, so
   the card simply swaps faces on a colour transition. */

const ROUND_SIZES = [10, 20, 40, 0] as const;

export function Flashcards() {
  const { vocab } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => vocab.map(p => p.id));
  const [direction, setDirection] = React.useState<'hu-en' | 'en-hu'>('hu-en');
  const [roundSize, setRoundSize] = React.useState<number>(20);

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
    const round = roundSize > 0 ? shuffle(pool).slice(0, roundSize) : shuffle(pool);
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

  // Space flips, then Enter or the right arrow keeps it, the left arrow repeats it.
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
  const front = card ? (direction === 'hu-en' ? card.hungarian : card.english) : '';
  const back = card ? (direction === 'hu-en' ? card.english : card.hungarian) : '';

  return (
    <div>
      <SectionHeading
        eyebrow="Vocabulary"
        note="One side shows the word, the other the translation. Cards you do not know come back at the end of the round."
      >Flashcards</SectionHeading>

      {!queue && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
          <PackPicker packs={vocab} selected={selectedPacks} onChange={setSelectedPacks} itemNoun="words" />

          <div>
            <p style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>Direction</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              <ChoiceChip selected={direction === 'hu-en'} onToggle={() => setDirection('hu-en')}>Hungarian to English</ChoiceChip>
              <ChoiceChip selected={direction === 'en-hu'} onToggle={() => setDirection('en-hu')}>English to Hungarian</ChoiceChip>
            </div>
          </div>

          <div>
            <p style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>Cards in this round</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {ROUND_SIZES.map(n => (
                <ChoiceChip key={n} selected={roundSize === n} onToggle={() => setRoundSize(n)}>
                  {n === 0 ? 'Everything (' + pool.length + ')' : n}
                </ChoiceChip>
              ))}
            </div>
          </div>

          <div>
            <Button size="lg" onClick={start} disabled={pool.length === 0}>Start round</Button>
            {pool.length === 0 && (
              <p style={{ font: 'var(--type-caption)', color: 'var(--bark)', marginTop: 'var(--space-2)' }}>
                Choose at least one pack, or upload a CSV below.
              </p>
            )}
          </div>
        </div>
      )}

      {queue && !finished && card && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-3)', font: 'var(--type-caption)', color: 'var(--bark)',
          }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {roundTotal - queue.length + 1} of {roundTotal}, {queue.length} left
            </span>
            <Button variant="ghost" size="sm" onClick={() => setQueue(null)}>End round</Button>
          </div>

          <button
            type="button"
            onClick={() => setFlipped(f => !f)}
            style={{
              width: '100%', minHeight: 260, background: flipped ? 'var(--linen)' : 'var(--white)',
              border: '1px solid ' + (flipped ? 'var(--border-pale)' : 'var(--border-hairline)'),
              borderRadius: 'var(--radius-none)', cursor: 'pointer', textAlign: 'center',
              padding: 'var(--space-7) var(--space-5)', transition: 'var(--transition-ui)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 'var(--space-4)', font: 'var(--type-body)', color: 'var(--text-body)',
            }}
          >
            <span style={{ font: 'var(--type-eyebrow)', color: 'var(--bark)' }}>
              {flipped
                ? (direction === 'hu-en' ? 'English' : 'Hungarian')
                : (direction === 'hu-en' ? 'Hungarian' : 'English')}
            </span>
            <span aria-live="polite" style={{
              font: 'var(--weight-medium) var(--size-h4)/var(--leading-snug) var(--font-core)',
              letterSpacing: 'var(--tracking-lg)',
            }}>{flipped ? back : front}</span>
            {flipped && card.example && (
              <span style={{ font: 'var(--type-small)', color: 'var(--bark)', maxWidth: 'var(--measure-narrow)' }}>
                {card.example}
              </span>
            )}
            {!flipped && (
              <span style={{ font: 'var(--type-caption)', color: 'var(--bark)' }}>
                Click the card or press space to turn it over
              </span>
            )}
          </button>

          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button onClick={() => answer(true)} disabled={!flipped}>I knew it</Button>
            <Button variant="secondary" onClick={() => answer(false)} disabled={!flipped}>Practise again</Button>
            {card.category && <span style={{ marginLeft: 'auto' }}><Badge tone="neutral">{card.category}</Badge></span>}
          </div>
        </div>
      )}

      {finished && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <ScoreSummary
            score={roundTotal - missed.size}
            total={roundTotal}
            onRestart={start}
            restartLabel="New round"
          >
            <p style={{ font: 'var(--type-small)', color: 'var(--bark)' }}>
              {missed.size === 0
                ? 'Every card was known first time.'
                : missed.size + (missed.size === 1 ? ' card needed' : ' cards needed') + ' a second look, and each one came back until you got it.'}
            </p>
          </ScoreSummary>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setQueue(null)}>Change packs</Button>
          </div>
        </div>
      )}

      <CsvUpload kind="vocab" label="Add your own words" />
    </div>
  );
}
