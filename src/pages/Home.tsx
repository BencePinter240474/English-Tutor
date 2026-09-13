import React from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, SectionHeading } from '../design/components';
import { usePacks } from '../lib/packs';
import { loadStats } from '../lib/storage';

/* The front door. Four exercises, and an honest count of what is loaded into
   each one, so it is obvious that uploading a CSV made a difference. */

interface Tile {
  to: string;
  title: string;
  blurb: string;
  statKey: string;
  count: () => string;
}

export function Home() {
  const { vocab, grammar, reading } = usePacks();
  const [stats] = React.useState(() => loadStats());

  const words = vocab.reduce((n, p) => n + p.items.length, 0);
  const questions = grammar.reduce((n, p) => n + p.items.length, 0);
  const texts = reading.reduce((n, p) => n + p.items.length, 0);

  const tiles: Tile[] = [
    {
      to: '/flashcards', title: 'Flashcards', statKey: 'flashcards',
      blurb: 'Hungarian on one side, English on the other. Turn the card over to check yourself.',
      count: () => words + (words === 1 ? ' word' : ' words'),
    },
    {
      to: '/matching', title: 'Matching pairs', statKey: 'matching',
      blurb: 'A memory board. Turn two tiles over and find the word that goes with its translation.',
      count: () => words + (words === 1 ? ' word' : ' words'),
    },
    {
      to: '/grammar', title: 'Grammar exercises', statKey: 'grammar',
      blurb: 'Multiple choice, marked as you go, with a short explanation after every answer.',
      count: () => questions + (questions === 1 ? ' question' : ' questions'),
    },
    {
      to: '/reading', title: 'Reading', statKey: 'reading',
      blurb: 'Short texts with comprehension questions. The text stays on screen while you answer.',
      count: () => texts + (texts === 1 ? ' text' : ' texts'),
    },
  ];

  return (
    <div>
      <SectionHeading
        level={1}
        eyebrow="English practice"
        note="Four ways to practise, all of them extendable. Every exercise takes a CSV upload, so the material grows as fast as you can type it."
      >Practise English</SectionHeading>

      <div style={{
        display: 'grid', gap: 'var(--space-4)', marginTop: 'var(--space-7)',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      }}>
        {tiles.map(t => {
          const s = stats[t.statKey];
          return (
            <Card key={t.to} title={t.title} eyebrow={t.count()}>
              <p style={{ font: 'var(--type-small)', color: 'var(--bark)', minHeight: 90 }}>{t.blurb}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-4)', flexWrap: 'wrap' }}>
                <Link to={t.to} style={{ textDecoration: 'none' }}>
                  <Button size="sm">Start</Button>
                </Link>
                {s?.lastScore != null && s.lastTotal != null && (
                  <span style={{ font: 'var(--type-caption)', color: 'var(--bark)', fontVariantNumeric: 'tabular-nums' }}>
                    Last time {s.lastScore} of {s.lastTotal}
                  </span>
                )}
                {s?.runs ? <Badge tone="neutral">{s.runs} {s.runs === 1 ? 'round' : 'rounds'}</Badge> : null}
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeading level={2} note="Upload a CSV of your own words, questions or texts and it joins the exercises straight away. Everything stays in this browser.">
          Your own material
        </SectionHeading>
        <div style={{ marginTop: 'var(--space-4)' }}>
          <Link to="/packs" style={{ textDecoration: 'none' }}>
            <Button variant="secondary">Manage packs and uploads</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
