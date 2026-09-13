import React from 'react';
import { Badge, Button, Card, Icon, ListRow, ListSection, ProgressBar } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { PackPicker } from '../components/PackPicker';
import { ScoreSummary } from '../components/ScoreSummary';
import { Screen } from '../components/Screen';
import { AnswerOption } from '../components/AnswerOption';
import { usePacks } from '../lib/packs';
import { recordRun } from '../lib/storage';
import type { ReadingPassage } from '../lib/types';

/* Reading and comprehension.

   The passage stays on the page while the questions are answered, because
   comprehension is about going back to the text, not remembering it. Prose
   is capped at a comfortable measure and set at body size with generous
   leading, which is what makes a long passage readable on a phone. */

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
  const answered = passage ? passage.questions.filter(q => answers[q.id] != null).length : 0;
  const answeredAll = passage != null && answered === passage.questions.length;

  const finish = () => {
    if (!passage) return;
    recordRun('reading', score, passage.questions.length);
    setFinished(true);
  };

  return (
    <Screen
      title={passage ? passage.title : 'Reading'}
      backTo={passage ? undefined : '/'}
      onBack={passage ? () => setPassage(null) : undefined}
      backLabel={passage ? 'Texts' : 'Practise'}
    >
      {!passage && (
        <>
          <PackPicker
            packs={reading} selected={selectedPacks} onChange={setSelectedPacks}
            itemNoun="texts"
          />

          {passages.length === 0 ? (
            <p style={{ font: 'var(--text-subheadline)', color: 'var(--label-secondary)', textAlign: 'center', padding: 'var(--space-6) 0' }}>
              Choose at least one pack, or add a CSV below.
            </p>
          ) : (
            <ListSection header="Texts" footer="Each text has a few comprehension questions.">
              {passages.map(p => (
                <ListRow
                  key={p.id}
                  title={p.title}
                  subtitle={(p.level ? 'Level ' + p.level + ', ' : '')
                    + p.questions.length + (p.questions.length === 1 ? ' question' : ' questions')}
                  symbol={<Icon name="book" size={17} weight={2} />}
                  symbolColor="var(--green)"
                  accessory="chevron"
                  onClick={() => open(p)}
                />
              ))}
            </ListSection>
          )}

          <div style={{ marginTop: 'var(--space-7)' }}>
            <CsvUpload kind="reading" label="Add your own texts" />
          </div>
        </>
      )}

      {passage && (
        <>
          <Card padding="roomy" style={{ marginBottom: 'var(--space-7)' }}>
            {passage.level && (
              <div style={{ marginBottom: 'var(--space-3)' }}>
                <Badge tone="info">Level {passage.level}</Badge>
              </div>
            )}
            <h2 style={{ font: 'var(--text-title-2)', letterSpacing: 'var(--tracking-title-2)', marginBottom: 'var(--space-4)' }}>
              {passage.title}
            </h2>
            <div style={{ maxWidth: 'var(--reading-width)' }}>
              {passage.text.split(/\n+/).map((para, i) => (
                <p key={i} style={{
                  font: 'var(--text-body)', letterSpacing: 'var(--tracking-body)',
                  lineHeight: 1.55, marginBottom: 'var(--space-3)',
                }}>{para}</p>
              ))}
            </div>
          </Card>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              font: 'var(--text-footnote)', color: 'var(--label-secondary)',
              letterSpacing: 'var(--tracking-footnote)', marginBottom: 6,
              fontVariantNumeric: 'tabular-nums',
            }}>
              <span>{answered} of {passage.questions.length} answered</span>
              <span>{score} right</span>
            </div>
            <ProgressBar value={answered} max={passage.questions.length} />
          </div>

          <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-7)' }}>
            {passage.questions.map((q, qi) => {
              const chosen = answers[q.id] ?? null;
              const right = chosen != null && chosen.toLowerCase() === q.answer.toLowerCase();
              return (
                <li key={q.id}>
                  <h3 style={{
                    font: 'var(--text-headline)', letterSpacing: 'var(--tracking-headline)',
                    marginBottom: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)',
                  }}>
                    <span style={{ color: 'var(--label-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{qi + 1}</span>
                    <span>{q.question}</span>
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {q.options.map(option => (
                      <AnswerOption
                        key={option} option={option} chosen={chosen}
                        answer={q.answer} onChoose={opt => choose(q.id, opt)}
                      />
                    ))}
                  </div>
                  {chosen && (
                    <Card padding="compact" style={{ marginTop: 'var(--space-3)' }}>
                      <Badge tone={right ? 'positive' : 'negative'} solid>
                        {right ? 'Correct' : 'Not this time'}
                      </Badge>
                      <p style={{ font: 'var(--text-footnote)', marginTop: 'var(--space-2)', letterSpacing: 'var(--tracking-footnote)' }}>
                        {q.explanation ?? 'The answer is "' + q.answer + '".'}
                      </p>
                    </Card>
                  )}
                </li>
              );
            })}
          </ol>

          {!finished && (
            <div style={{ marginTop: 'var(--space-7)' }}>
              <Button block size="large" onClick={finish} disabled={!answeredAll}>
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
        </>
      )}
    </Screen>
  );
}

