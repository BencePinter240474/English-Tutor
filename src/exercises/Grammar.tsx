import React from 'react';
import { Badge, Button, Card, ProgressBar, SegmentedControl } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { ScoreSummary } from '../components/ScoreSummary';
import { Screen } from '../components/Screen';
import { AnswerOption } from '../components/AnswerOption';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import { shuffle } from '../lib/shuffle';
import type { GrammarItem } from '../lib/types';

/* Grammar.

   One question at a time, marked as soon as an option is chosen, with the
   explanation shown straight away. Marking at the end would mean reading
   twenty explanations in a row, which nobody does. */

const ROUND_SIZES = [
  { value: '10', label: '10' },
  { value: '20', label: '20' },
  { value: '0', label: 'All' },
];

interface Answered {
  item: GrammarItem;
  chosen: string;
  correct: boolean;
}

export function Grammar() {
  const { grammar } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => grammar.map(p => p.id));
  const [roundSize, setRoundSize] = React.useState('10');

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
    const size = Number(roundSize);
    setQuestions(size > 0 ? shuffle(pool).slice(0, size) : shuffle(pool));
    setIndex(0);
    setChosen(null);
    setLog([]);
  }, [pool, roundSize]);

  const current = questions?.[index];
  const finished = questions != null && index >= questions.length;

  // The options are shuffled per question, so the answer is not always third.
  const options = React.useMemo(() => (current ? shuffle(current.options) : []), [current]);

  const choose = (option: string) => {
    if (chosen || !current) return;
    setChosen(option);
    setLog(l => [...l, {
      item: current, chosen: option,
      correct: option.toLowerCase() === current.answer.toLowerCase(),
    }]);
  };

  const next = () => {
    if (!questions) return;
    const at = index + 1;
    setChosen(null);
    setIndex(at);
    if (at >= questions.length) {
      recordRun('grammar', log.filter(a => a.correct).length, questions.length);
    }
  };

  const score = log.filter(a => a.correct).length;
  const right = chosen != null && current != null
    && chosen.toLowerCase() === current.answer.toLowerCase();

  // The gap is written as ___ in the CSV. Draw it as a rule, not as letters.
  const renderPrompt = (text: string) => text.split('___').map((part, i, all) => (
    <React.Fragment key={i}>
      {part}
      {i < all.length - 1 && (
        <span style={{
          display: 'inline-block', minWidth: 64,
          borderBottom: '3px solid var(--tint)', margin: '0 6px',
          verticalAlign: 'baseline',
        }} />
      )}
    </React.Fragment>
  ));

  return (
    <Screen
      title="Grammar"
      backTo="/"
      backLabel="Practise"
      trailing={questions && !finished
        ? <Button variant="plain" size="small" onClick={() => setQuestions(null)}>End</Button>
        : undefined}
    >
      {!questions && (
        <>
          <PackPicker
            packs={grammar} selected={selectedPacks} onChange={setSelectedPacks}
            itemNoun="questions"
          />
          <div style={{ marginBottom: 'var(--space-7)' }}>
            <div style={{ font: 'var(--text-list-header)', color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 var(--space-4) var(--space-2)' }}>
              Questions in this round
            </div>
            <SegmentedControl segments={ROUND_SIZES} value={roundSize} onChange={setRoundSize} />
          </div>
          <Button block size="large" onClick={start} disabled={pool.length === 0}>Start round</Button>
          {pool.length === 0 && (
            <p style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', textAlign: 'center', marginTop: 'var(--space-3)' }}>
              Choose at least one pack, or add a CSV below.
            </p>
          )}
          <div style={{ marginTop: 'var(--space-7)' }}>
            <CsvUpload kind="grammar" label="Add your own questions" />
          </div>
        </>
      )}

      {current && (
        <>
          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              font: 'var(--text-footnote)', color: 'var(--label-secondary)',
              letterSpacing: 'var(--tracking-footnote)', marginBottom: 6,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span>Question {index + 1} of {questions!.length}</span>
              <span>{score} right</span>
            </div>
            <ProgressBar value={index} max={questions!.length} />
          </div>

          {current.topic && (
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <Badge tone="info">{current.topic}</Badge>
            </div>
          )}

          <h2 style={{
            font: 'var(--text-title-2)', letterSpacing: 'var(--tracking-title-2)',
            color: 'var(--label)', marginBottom: 'var(--space-6)',
          }}>{renderPrompt(current.prompt)}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {options.map(option => (
              <AnswerOption
                key={option} option={option} chosen={chosen}
                answer={current.answer} onChoose={choose}
              />
            ))}
          </div>

          {chosen && (
            <Card padding="regular" style={{ marginTop: 'var(--space-5)' }}>
              <Badge tone={right ? 'positive' : 'negative'} solid>
                {right ? 'Correct' : 'Not this time'}
              </Badge>
              <p style={{ font: 'var(--text-subheadline)', marginTop: 'var(--space-3)', letterSpacing: 'var(--tracking-subheadline)' }}>
                {current.explanation ?? 'The answer is "' + current.answer + '".'}
              </p>
            </Card>
          )}

          <div style={{ marginTop: 'var(--space-6)' }}>
            <Button block size="large" onClick={next} disabled={!chosen}>
              {index + 1 >= questions!.length ? 'See the result' : 'Next question'}
            </Button>
          </div>
        </>
      )}

      {finished && (
        <ScoreSummary
          score={score}
          total={questions!.length}
          onRestart={start}
          restartLabel="New round"
          secondaryLabel="Change packs"
          onSecondary={() => setQuestions(null)}
        >
          {log.some(a => !a.correct) && (
            <>
              <div style={{ font: 'var(--text-list-header)', color: 'var(--label-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Worth another look
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {log.filter(a => !a.correct).map((a, i) => (
                  <li key={i} style={{
                    padding: 'var(--space-3)', borderRadius: 'var(--radius-control)',
                    background: 'var(--fill-quaternary)',
                  }}>
                    <p style={{ font: 'var(--text-subheadline)', letterSpacing: 'var(--tracking-subheadline)' }}>
                      {a.item.prompt.replace('___', '_____')}
                    </p>
                    <p style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', marginTop: 4, letterSpacing: 'var(--tracking-footnote)' }}>
                      You chose "{a.chosen}". The answer is "{a.item.answer}".
                    </p>
                  </li>
                ))}
              </ul>
            </>
          )}
        </ScoreSummary>
      )}
    </Screen>
  );
}
