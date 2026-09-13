import React from 'react';
import { Badge, Button, Card, Icon, SegmentedControl } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { Screen } from '../components/Screen';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import { sample, shuffle } from '../lib/shuffle';

/* Matching pairs.

   A memory board. Every word contributes two tiles, the Hungarian and the
   English, and a pair is made when both belong to the same word. The measure
   is efficiency: the fewest possible turns is one per pair.

   A face down tile is a neutral fill, a face up tile is tinted, and a matched
   pair goes green and stops responding. The tile scales on press like any
   other control. */

interface Tile {
  key: string;
  itemId: string;
  text: string;
}

const PAIR_COUNTS = [
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
  { value: '10', label: '10' },
];
const PEEK_MS = 900;

export function Matching() {
  const { vocab } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => vocab.map(p => p.id));
  const [pairCount, setPairCount] = React.useState('6');

  const [tiles, setTiles] = React.useState<Tile[] | null>(null);
  const [faceUp, setFaceUp] = React.useState<string[]>([]);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [turns, setTurns] = React.useState(0);
  const [locked, setLocked] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState(0);
  const [elapsed, setElapsed] = React.useState(0);

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

  const pairs = tiles ? tiles.length / 2 : 0;
  const solved = tiles != null && matched.size === pairs;

  // The clock runs while the board is unsolved, and stops on the last pair.
  React.useEffect(() => {
    if (!tiles || solved) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [tiles, solved, startedAt]);

  const start = React.useCallback(() => {
    const picked = sample(pool, Number(pairCount));
    const built: Tile[] = picked.flatMap(item => ([
      { key: item.id + ':hu', itemId: item.id, text: item.hungarian },
      { key: item.id + ':en', itemId: item.id, text: item.english },
    ]));
    setTiles(shuffle(built));
    setFaceUp([]);
    setMatched(new Set());
    setTurns(0);
    setLocked(false);
    setStartedAt(Date.now());
    setElapsed(0);
  }, [pool, pairCount]);

  const flip = (tile: Tile) => {
    if (locked || !tiles) return;
    if (matched.has(tile.itemId) || faceUp.includes(tile.key)) return;
    const next = [...faceUp, tile.key];
    setFaceUp(next);
    if (next.length < 2) return;

    setTurns(t => t + 1);
    const a = tiles.find(t => t.key === next[0])!;
    const b = tiles.find(t => t.key === next[1])!;

    if (a.itemId === b.itemId) {
      const nextMatched = new Set(matched).add(a.itemId);
      setMatched(nextMatched);
      setFaceUp([]);
      if (nextMatched.size === pairs) {
        // Fewest possible turns is one per pair, so that is the denominator.
        recordRun('matching', pairs, turns + 1);
      }
      return;
    }
    // A wrong pair stays visible long enough to be read, then turns back.
    setLocked(true);
    window.setTimeout(() => { setFaceUp([]); setLocked(false); }, PEEK_MS);
  };

  const mmss = (s: number) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  return (
    <Screen
      title="Matching pairs"
      backTo="/"
      backLabel="Practise"
      trailing={tiles && !solved
        ? <Button variant="plain" size="small" onClick={() => setTiles(null)}>End</Button>
        : undefined}
    >
      {!tiles && (
        <>
          <PackPicker
            packs={vocab} selected={selectedPacks} onChange={setSelectedPacks}
            itemNoun="words"
          />
          <div style={{ marginBottom: 'var(--space-7)' }}>
            <div style={{ font: 'var(--text-list-header)', color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 var(--space-4) var(--space-2)' }}>
              Pairs on the board
            </div>
            <SegmentedControl
              segments={PAIR_COUNTS}
              value={pairCount} onChange={setPairCount}
            />
          </div>
          <Button block size="large" onClick={start} disabled={pool.length < 2}>Deal the board</Button>
          {pool.length < 2 && (
            <p style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
              At least two words are needed. Choose a pack, or add a CSV below.
            </p>
          )}
          <div style={{ marginTop: 'var(--space-7)' }}>
            <CsvUpload kind="vocab" label="Add your own words" />
          </div>
        </>
      )}

      {tiles && (
        <>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            font: 'var(--text-subheadline)', color: 'var(--label-secondary)',
            letterSpacing: 'var(--tracking-subheadline)', marginBottom: 'var(--space-4)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            <span>{matched.size} of {pairs} pairs</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Icon name="clock" size={14} weight={2} />
              {mmss(elapsed)}
              <span style={{ color: 'var(--label-tertiary)' }}>&middot;</span>
              {turns} {turns === 1 ? 'turn' : 'turns'}
            </span>
          </div>

          <div style={{
            display: 'grid', gap: 'var(--space-3)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
          }}>
            {tiles.map(tile => {
              const isMatched = matched.has(tile.itemId);
              const isUp = isMatched || faceUp.includes(tile.key);
              return (
                <TileButton
                  key={tile.key} tile={tile} isUp={isUp} isMatched={isMatched}
                  onFlip={() => flip(tile)}
                />
              );
            })}
          </div>

          {solved && (
            <Card padding="roomy" raised style={{ marginTop: 'var(--space-6)' }}>
              <div style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-footnote)' }}>
                Board cleared
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--space-3)', margin: '2px 0 var(--space-3)', flexWrap: 'wrap' }}>
                <span style={{ font: 'var(--text-large-title)', letterSpacing: 'var(--tracking-large-title)', fontVariantNumeric: 'tabular-nums' }}>
                  {turns} {turns === 1 ? 'turn' : 'turns'}
                </span>
                {turns === pairs && <Badge tone="positive" solid>Perfect</Badge>}
              </div>
              <p style={{ font: 'var(--text-subheadline)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-subheadline)' }}>
                {turns === pairs
                  ? 'Every turn found a pair.'
                  : 'The fewest possible is ' + pairs + '. You finished in ' + mmss(elapsed) + '.'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
                <Button onClick={start}>Deal again</Button>
                <Button variant="gray" onClick={() => setTiles(null)}>Change packs</Button>
              </div>
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}

/* A single tile. Its own component so the press state is local and turning
   one tile does not re-render the whole board. */
function TileButton({ tile, isUp, isMatched, onFlip }: {
  tile: Tile; isUp: boolean; isMatched: boolean; onFlip: () => void;
}) {
  const [pressed, setPressed] = React.useState(false);
  const release = () => setPressed(false);
  return (
    <button
      type="button" onClick={onFlip} disabled={isMatched}
      aria-label={isUp ? tile.text : 'Face down tile'}
      onPointerDown={() => !isMatched && setPressed(true)}
      onPointerUp={release} onPointerLeave={release} onPointerCancel={release}
      style={{
        minHeight: 96, padding: 'var(--space-3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', border: 'none',
        borderRadius: 'var(--radius-card)',
        background: isMatched ? 'var(--green)' : isUp ? 'var(--tint)' : 'var(--fill-secondary)',
        color: isUp ? '#FFFFFF' : 'transparent',
        font: 'var(--text-callout)', fontWeight: 600,
        letterSpacing: 'var(--tracking-callout)',
        cursor: isMatched ? 'default' : 'pointer',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'var(--transition-control)',
      }}
    >
      {isUp ? tile.text : ''}
    </button>
  );
}
