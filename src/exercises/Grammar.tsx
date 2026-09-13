import React from 'react';
import { Badge, Button, ChoiceChip, SectionHeading } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { ScoreSummary } from '../components/ScoreSummary';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import { shuffle } from '../lib/shuffle';
import type { GrammarItem } from '../lib/types';

/* Grammar.

   One question at a time, marked as soon as an option is chosen, with the
   explanation shown straight away. Marking at the end would make the learner
   read twenty explanations in a row, which nobody does.

   Right and wrong are said in words, not signalled by colour: elho ink is
   Graphite or white, and status is carried by a badge with a word in it. */

const ROUND_SIZES = [10, 20, 0] as const;

interface Answered {
  item: GrammarItem;
  chosen: string;
  correct: boolean;
}

export function Grammar() {
  const { grammar } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => grammar.map(p => p.id));
  const [roundSize, setRoundSize] = React.useState<number>(10);

  const [questions, setQuestions] = React.useState<GrammarItem[] | null>(null);
  const [index, setIndex] = React.useState(0);
  const [chosen, setChosen] = React.useState<string | null>(null);
  const [log, setLog] = React.useState<Answered[]>([]);

  React.useEffect(() => {
    setSelectedPacks(prev => {
      const known = new Set(prev);
      const added = grammar.filter(p => !known.has(p.id)).map(p => p.id);
      return added.length ? [...prev, ...added] : prev;
    });
  }, [grammar]);

  const pool = React.useMemo(
    () => grammar.filter(p => selectedPacks.includes(p.id)).flatMap(p => p.items),
    [grammar, selectedPacks],
  );

  const start = React.useCallback(() => {
    const round = roundSize > 0 ? shuffle(pool).slice(0, roundSize) : shuffle(pool);
    setQuestions(round);
    setIndex(0);
    setChosen(null);
    setLog([]);
  }, [pool, roundSize]);

  const current = questions?.[index];
  const finished = questions != null && index >= questions.length;

  // The options are shuffled per question, so the answer is not always third.
  const options = React.useMemo(
    () => (current ? shuffle(current.options) : []),
    [current],
  );

  const choose = (option: string) => {
    if (chosen || !current) return;
    const correct = option.toLowerCase() === current.answer.toLowerCase();
    setChosen(option);
    setLog(l => [...l, { item: current, chosen: option, correct }]);
  };

  const next = () => {
    if (!questions) return;
    const at = index + 1;
    setChosen(null);
    setIndex(at);
    if (at >= questions.length) {
      const score = log.filter(a => a.correct).length;
      recordRun('grammar', score, questions.length);
    }
  };

  const score = log.filter(a => a.correct).length;

  // The gap is written as ___ in the CSV. Draw it as a rule, not as letters.
  const renderPrompt = (text: string) => {
    const parts = text.split('___');
    return parts.map((part, i) => (
      <React.Fragment key={i}>
        {part}
        {i < parts.length - 1 && (
          <span style={{
            display: 'inline-block', minWidth: 72, borderBottom: '2px solid var(--leaf)',
            verticalAlign: 'baseline', margin: '0 4px',
          }} />
        )}
      </React.Fragment>
    ));
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Grammar"
        note="Multiple choice, marked as you go, with a short explanation after every answer."
      >Grammar exercises</SectionHeading>

      {!questions && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
          <PackPicker packs={grammar} selected={selectedPacks} onChange={setSelectedPacks} itemNoun="questions" />
          <div>
            <p style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>Questions in this round</p>
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

      {current && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-4)', font: 'var(--type-caption)', color: 'var(--bark)',
          }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              Question {index + 1} of {questions!.length}, {score} right so far
            </span>
            <Button variant="ghost" size="sm" onClick={() => setQuestions(null)}>End round</Button>
          </div>

          {current.topic && <div style={{ marginBottom: 'var(--space-3)' }}><Badge tone="neutral">{current.topic}</Badge></div>}

          <p style={{
            font: 'var(--weight-medium) var(--size-h4)/var(--leading-snug) var(--font-core)',
            letterSpacing: 'var(--tracking-lg)', maxWidth: 'var(--measure-prose)',
            marginBottom: 'var(--space-5)',
          }}>{renderPrompt(current.prompt)}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: 520 }}>
            {options.map(option => {
              const isAnswer = option.toLowerCase() === current.answer.toLowerCase();
              const isChosen = chosen === option;
              // After marking, the correct option is shown selected whatever
              // was picked, so the right form is always the one on Leaf.
              return (
                <ChoiceChip
                  key={option}
                  selected={chosen ? isAnswer : false}
                  onToggle={() => choose(option)}
                  style={{ ...(chosen ? { cursor: 'default' } : null), ...(chosen && isAnswer ? { background: 'var(--leaf)', color: 'var(--white)' } : null), ...(chosen && isChosen && !isAnswer
                    ? { border: '2px solid var(--graphite)', background: 'var(--linen)', color: 'var(--graphite)' }
                    : null) }}
                >
                  {option}
                  {chosen && isChosen && !isAnswer && (
                    <span style={{ font: 'var(--type-caption)', color: 'var(--bark)', marginLeft: 8 }}>your answer</span>
                  )}
                </ChoiceChip>
              );
            })}
          </div>

          {chosen && (
            <div style={{
              marginTop: 'var(--space-5)', padding: 'var(--space-4)',
              borderLeft: 'var(--border-width-accent) solid ' + (chosen.toLowerCase() === current.answer.toLowerCase() ? 'var(--leaf)' : 'var(--graphite)'),
              background: 'var(--surface-pale)', maxWidth: 'var(--measure-prose)',
            }}>
              <Badge tone={chosen.toLowerCase() === current.answer.toLowerCase() ? 'positive' : 'negative'}>
                {chosen.toLowerCase() === current.answer.toLowerCase() ? 'Correct' : 'Not this time'}
              </Badge>
              <p style={{ font: 'var(--type-small)', marginTop: 'var(--space-3)' }}>
                {current.explanation ?? ('The answer is "' + current.answer + '".')}
              </p>
            </div>
          )}

          <div style={{ marginTop: 'var(--space-5)' }}>
            <Button onClick={next} disabled={!chosen}>
              {index + 1 >= questions!.length ? 'See the result' : 'Next question'}
            </Button>
          </div>
        </div>
      )}

      {finished && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <ScoreSummary score={score} total={questions!.length} onRestart={start} restartLabel="New round">
            {log.some(a => !a.correct) && (
              <div>
                <p style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-3)' }}>
                  Worth another look
                </p>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                  {log.filter(a => !a.correct).map((a, i) => (
                    <li key={i} style={{ borderTop: '1px solid var(--border-hairline)', paddingTop: 'var(--space-3)' }}>
                      <p style={{ font: 'var(--type-small)' }}>{a.item.prompt.replace('___', '_____')}</p>
                      <p style={{ font: 'var(--type-caption)', color: 'var(--bark)', marginTop: 'var(--space-1)' }}>
                        You chose "{a.chosen}". The answer is "{a.item.answer}".
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </ScoreSummary>
          <div style={{ marginTop: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setQuestions(null)}>Change packs</Button>
          </div>
        </div>
      )}

      <CsvUpload kind="grammar" label="Add your own questions" />
    </div>
  );
}
