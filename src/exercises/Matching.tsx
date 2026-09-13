import React from 'react';
import { Button, Card, ChoiceChip, SectionHeading } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import { sample, shuffle } from '../lib/shuffle';

/* Matching pairs.

   A memory board. Every word contributes two tiles, the Hungarian and the
   English, and a pair is made when both tiles belong to the same word. The
   score is efficiency: the fewest possible turns is one per pair, so a board
   of eight pairs solved in eight turns is perfect recall.

   Tiles are square and flat, as elho containers are. A face down tile is
   Graphite, a face up tile Linen, a matched pair Lime, which walks down the
   value ladder as the board is solved. */

interface Tile {
  key: string;
  itemId: string;
  text: string;
  side: 'hu' | 'en';
}

const PAIR_COUNTS = [4, 6, 8, 10] as const;
const PEEK_MS = 900;

export function Matching() {
  const { vocab } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => vocab.map(p => p.id));
  const [pairCount, setPairCount] = React.useState<number>(6);

  const [tiles, setTiles] = React.useState<Tile[] | null>(null);
  const [faceUp, setFaceUp] = React.useState<string[]>([]);
  const [matched, setMatched] = React.useState<Set<string>>(new Set());
  const [turns, setTurns] = React.useState(0);
  const [locked, setLocked] = React.useState(false);
  const [startedAt, setStartedAt] = React.useState<number>(0);
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

  const solved = tiles != null && matched.size === tiles.length / 2;

  // The clock runs while the board is unsolved, and stops on the last pair.
  React.useEffect(() => {
    if (!tiles || solved) return;
    const id = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [tiles, solved, startedAt]);

  const start = React.useCallback(() => {
    const picked = sample(pool, pairCount);
    const built: Tile[] = picked.flatMap(item => ([
      { key: item.id + ':hu', itemId: item.id, text: item.hungarian, side: 'hu' as const },
      { key: item.id + ':en', itemId: item.id, text: item.english, side: 'en' as const },
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
    const [aKey, bKey] = next;
    const a = tiles.find(t => t.key === aKey)!;
    const b = tiles.find(t => t.key === bKey)!;

    if (a.itemId === b.itemId) {
      const nextMatched = new Set(matched).add(a.itemId);
      setMatched(nextMatched);
      setFaceUp([]);
      if (nextMatched.size === tiles.length / 2) {
        // Fewest possible turns is one per pair, so that is the denominator.
        recordRun('matching', tiles.length / 2, turns + 1);
      }
      return;
    }
    // A wrong pair stays visible long enough to be read, then turns back.
    setLocked(true);
    window.setTimeout(() => { setFaceUp([]); setLocked(false); }, PEEK_MS);
  };

  const mmss = (s: number) => Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');

  return (
    <div>
      <SectionHeading
        eyebrow="Vocabulary"
        note="Turn two tiles over at a time and find the Hungarian word that goes with the English one."
      >Matching pairs</SectionHeading>

      {!tiles && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
          <PackPicker packs={vocab} selected={selectedPacks} onChange={setSelectedPacks} itemNoun="words" />
          <div>
            <p style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>Pairs on the board</p>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
              {PAIR_COUNTS.map(n => (
                <ChoiceChip
                  key={n} selected={pairCount === n} disabled={pool.length < n}
                  onToggle={() => setPairCount(n)}
                >{n} pairs</ChoiceChip>
              ))}
            </div>
          </div>
          <div>
            <Button size="lg" onClick={start} disabled={pool.length < 2}>Deal the board</Button>
            {pool.length < 2 && (
              <p style={{ font: 'var(--type-caption)', color: 'var(--bark)', marginTop: 'var(--space-2)' }}>
                At least two words are needed. Choose a pack, or upload a CSV below.
              </p>
            )}
          </div>
        </div>
      )}

      {tiles && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-3)', font: 'var(--type-caption)', color: 'var(--bark)',
            gap: 'var(--space-4)', flexWrap: 'wrap',
          }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {matched.size} of {tiles.length / 2} pairs, {turns} {turns === 1 ? 'turn' : 'turns'}, {mmss(elapsed)}
            </span>
            <Button variant="ghost" size="sm" onClick={() => setTiles(null)}>Leave the board</Button>
          </div>

          <div style={{
            display: 'grid', gap: 'var(--space-3)',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          }}>
            {tiles.map(tile => {
              const isMatched = matched.has(tile.itemId);
              const isUp = isMatched || faceUp.includes(tile.key);
              return (
                <button
                  key={tile.key} type="button"
                  onClick={() => flip(tile)}
                  disabled={isMatched}
                  aria-label={isUp ? tile.text : 'Face down tile'}
                  style={{
                    minHeight: 96, padding: 'var(--space-4)',
                    background: isMatched ? 'var(--lime)' : isUp ? 'var(--linen)' : 'var(--graphite)',
                    color: isUp ? 'var(--graphite)' : 'var(--white)',
                    border: '1px solid ' + (isMatched ? 'var(--pebble)' : isUp ? 'var(--border-pale)' : 'var(--graphite)'),
                    borderRadius: 'var(--radius-none)',
                    font: (isUp ? 'var(--weight-medium)' : 'var(--weight-regular)') + ' var(--size-body)/1.2 var(--font-core)',
                    cursor: isMatched ? 'default' : 'pointer',
                    transition: 'var(--transition-ui)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                  }}
                >
                  {isUp ? tile.text : ''}
                </button>
              );
            })}
          </div>

          {solved && (
            <Card padding="lg" style={{ marginTop: 'var(--space-5)' }}>
              <div style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>
                Board cleared
              </div>
              <div style={{
                font: 'var(--weight-medium) var(--size-h3)/var(--leading-tight) var(--font-core)',
                letterSpacing: 'var(--tracking-lg)', fontVariantNumeric: 'tabular-nums',
              }}>
                {turns} {turns === 1 ? 'turn' : 'turns'}
              </div>
              <p style={{ font: 'var(--type-small)', color: 'var(--bark)', marginTop: 'var(--space-3)' }}>
                {turns === tiles.length / 2
                  ? 'Perfect. Every turn found a pair.'
                  : 'The fewest possible is ' + (tiles.length / 2) + '. You finished in ' + mmss(elapsed) + '.'}
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-5)', flexWrap: 'wrap' }}>
                <Button onClick={start}>Deal again</Button>
                <Button variant="ghost" onClick={() => setTiles(null)}>Change packs</Button>
              </div>
            </Card>
          )}
        </div>
      )}

      <CsvUpload kind="vocab" label="Add your own words" />
    </div>
  );
}
