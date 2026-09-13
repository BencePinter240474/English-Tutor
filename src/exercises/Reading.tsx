import React from 'react';
import { Badge, Button, Card, ChoiceChip, SectionHeading } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { ScoreSummary } from '../components/ScoreSummary';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import type { ReadingPassage } from '../lib/types';

/* Reading and comprehension.

   The passage stays on the page while the questions are answered, because
   comprehension is about going back to the text, not about remembering it.
   Prose is capped at 68ch, which is the elho measure for reading.

   Each question is marked as it is answered, and the round closes when every
   question has been tried. */

export function Reading() {
  const { reading } = usePacks();
  const [selectedPacks, setSelectedPacks] = React.useState<string[]>(() => reading.map(p => p.id));
  const [passage, setPassage] = React.useState<ReadingPassage | null>(null);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [finished, setFinished] = React.useState(false);

  React.useEffect(() => {
    setSelectedPacks(prev => {
      const known = new Set(prev);
      const added = reading.filter(p => !known.has(p.id)).map(p => p.id);
      return added.length ? [...prev, ...added] : prev;
    });
  }, [reading]);

  const passages = React.useMemo(
    () => reading.filter(p => selectedPacks.includes(p.id)).flatMap(p => p.items),
    [reading, selectedPacks],
  );

  const open = (p: ReadingPassage) => {
    setPassage(p);
    setAnswers({});
    setFinished(false);
    window.scrollTo({ top: 0 });
  };

  const choose = (questionId: string, option: string) => {
    if (answers[questionId]) return;
    setAnswers(a => ({ ...a, [questionId]: option }));
  };

  const score = passage
    ? passage.questions.filter(q => answers[q.id]?.toLowerCase() === q.answer.toLowerCase()).length
    : 0;
  const answeredAll = passage != null && passage.questions.every(q => answers[q.id] != null);

  const finish = () => {
    if (!passage) return;
    recordRun('reading', score, passage.questions.length);
    setFinished(true);
  };

  return (
    <div>
      <SectionHeading
        eyebrow="Reading"
        note="Read the text, then answer the questions. The text stays on screen while you work."
      >Reading and comprehension</SectionHeading>

      {!passage && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginTop: 'var(--space-5)' }}>
          <PackPicker packs={reading} selected={selectedPacks} onChange={setSelectedPacks} itemNoun="texts" />

          {passages.length === 0 ? (
            <p style={{ font: 'var(--type-small)', color: 'var(--bark)' }}>
              Choose at least one pack, or upload a CSV below.
            </p>
          ) : (
            <div style={{ display: 'grid', gap: 'var(--space-3)', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
              {passages.map(p => (
                <Card
                  key={p.id}
                  eyebrow={p.level ? 'Level ' + p.level : undefined}
                  title={p.title}
                  footnote={p.questions.length + (p.questions.length === 1 ? ' question' : ' questions')}
                >
                  <p style={{ font: 'var(--type-caption)', color: 'var(--bark)' }}>
                    {p.text.length > 120 ? p.text.slice(0, 120).trimEnd() + '...' : p.text}
                  </p>
                  <div style={{ marginTop: 'var(--space-4)' }}>
                    <Button size="sm" onClick={() => open(p)}>Read this</Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {passage && (
        <div style={{ marginTop: 'var(--space-5)' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 'var(--space-4)', font: 'var(--type-caption)', color: 'var(--bark)',
          }}>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              {Object.keys(answers).length} of {passage.questions.length} answered
            </span>
            <Button variant="ghost" size="sm" onClick={() => setPassage(null)}>Back to the texts</Button>
          </div>

          <article style={{
            background: 'var(--surface-pale)', border: '1px solid var(--border-pale)',
            padding: 'var(--space-6)', maxWidth: 'var(--measure-prose)', marginBottom: 'var(--space-7)',
          }}>
            <h2 style={{ font: 'var(--type-h2)', letterSpacing: 'var(--tracking-lg)', marginBottom: 'var(--space-4)' }}>
              {passage.title}
            </h2>
            {passage.text.split(/\n+/).map((para, i) => (
              <p key={i} style={{ font: 'var(--type-body)', marginBottom: 'var(--space-3)' }}>{para}</p>
            ))}
          </article>

          <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {passage.questions.map((q, qi) => {
              const chosen = answers[q.id];
              const right = chosen != null && chosen.toLowerCase() === q.answer.toLowerCase();
              return (
                <li key={q.id}>
                  <p style={{
                    font: 'var(--weight-medium) var(--size-h6)/var(--leading-normal) var(--font-core)',
                    marginBottom: 'var(--space-3)', maxWidth: 'var(--measure-prose)',
                  }}>
                    <span style={{ color: 'var(--bark)', marginRight: 'var(--space-2)', fontVariantNumeric: 'tabular-nums' }}>
                      {qi + 1}.
                    </span>
                    {q.question}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', maxWidth: 520 }}>
                    {q.options.map(option => {
                      const isAnswer = option.toLowerCase() === q.answer.toLowerCase();
                      const isChosen = chosen === option;
                      return (
                        <ChoiceChip
                          key={option}
                          selected={chosen ? isAnswer : false}
                          onToggle={() => choose(q.id, option)}
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
                      marginTop: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)',
                      borderLeft: 'var(--border-width-accent) solid ' + (right ? 'var(--leaf)' : 'var(--graphite)'),
                      background: 'var(--surface-pale)', maxWidth: 'var(--measure-prose)',
                    }}>
                      <Badge tone={right ? 'positive' : 'negative'}>{right ? 'Correct' : 'Not this time'}</Badge>
                      <p style={{ font: 'var(--type-small)', marginTop: 'var(--space-2)' }}>
                        {q.explanation ?? ('The answer is "' + q.answer + '".')}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>

          {!finished && (
            <div style={{ marginTop: 'var(--space-7)' }}>
              <Button onClick={finish} disabled={!answeredAll}>
                {answeredAll ? 'Finish this text' : 'Answer every question to finish'}
              </Button>
            </div>
          )}

          {finished && (
            <div style={{ marginTop: 'var(--space-7)' }}>
              <ScoreSummary
                score={score}
                total={passage.questions.length}
                onRestart={() => setPassage(null)}
                restartLabel="Choose another text"
              />
            </div>
          )}
        </div>
      )}

      <CsvUpload kind="reading" label="Add your own texts" />
    </div>
  );
}
