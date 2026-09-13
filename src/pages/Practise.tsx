import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, ListRow, ListSection } from '../design/components';
import { Screen } from '../components/Screen';
import { usePacks } from '../lib/packs';
import { loadStats } from '../lib/storage';

/* The root of the Practise tab: the four exercises as a grouped list.

   Each row carries a tinted symbol, the way Settings marks its rows, and a
   subtitle saying how much material is loaded, so an upload visibly changes
   the screen it was made from. */

const EXERCISES = [
  { to: '/flashcards', title: 'Flashcards', icon: 'cards', colour: 'var(--blue)', statKey: 'flashcards', kind: 'vocab' as const },
  { to: '/matching', title: 'Matching pairs', icon: 'grid', colour: 'var(--purple)', statKey: 'matching', kind: 'vocab' as const },
  { to: '/grammar', title: 'Grammar', icon: 'text', colour: 'var(--orange)', statKey: 'grammar', kind: 'grammar' as const },
  { to: '/reading', title: 'Reading', icon: 'book', colour: 'var(--green)', statKey: 'reading', kind: 'reading' as const },
];

export function Practise() {
  const navigate = useNavigate();
  const { vocab, grammar, reading } = usePacks();
  const [stats] = React.useState(() => loadStats());

  const counts = {
    vocab: vocab.reduce((n, p) => n + p.items.length, 0),
    grammar: grammar.reduce((n, p) => n + p.items.length, 0),
    reading: reading.reduce((n, p) => n + p.items.length, 0),
  };
  const noun = { vocab: 'words', grammar: 'questions', reading: 'texts' };

  return (
    <Screen title="Practise" large>
      <ListSection
        header="Exercises"
        footer="Every exercise can be extended with a CSV of your own. Nothing leaves this browser."
      >
        {EXERCISES.map(ex => {
          const stat = stats[ex.statKey];
          const count = counts[ex.kind] + ' ' + noun[ex.kind];
          const last = stat?.lastScore != null && stat.lastTotal != null
            ? ', last round ' + stat.lastScore + ' of ' + stat.lastTotal
            : '';
          return (
            <ListRow
              key={ex.to}
              title={ex.title}
              subtitle={count + last}
              symbol={<Icon name={ex.icon} size={17} weight={2} />}
              symbolColor={ex.colour}
              accessory="chevron"
              onClick={() => navigate(ex.to)}
            />
          );
        })}
      </ListSection>

      <ListSection header="Material">
        <ListRow
          title="Your packs"
          subtitle="Add words, questions and texts"
          symbol={<Icon name="library" size={17} weight={2} />}
          symbolColor="var(--indigo)"
          accessory="chevron"
          onClick={() => navigate('/library')}
        />
      </ListSection>
    </Screen>
  );
}
