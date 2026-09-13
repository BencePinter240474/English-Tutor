import React from 'react';
import { Badge, Button, Card, Icon, ListRow, ListSection, TextField } from '../design/components';
import { usePacks } from '../lib/packs';
import { TEMPLATES, downloadCsv } from '../lib/templates';
import type { PackKind, RowError } from '../lib/types';

/* Every exercise is extended the same way: drop a CSV in here.

   Collapsed it is a single row, so it never competes with the exercise
   itself. Open it states the exact columns the parser wants, because a
   failed upload with no explanation is worse than no upload at all. */

interface Props {
  kind: PackKind;
  label: string;
}

interface Outcome {
  tone: 'positive' | 'negative';
  headline: string;
  errors: RowError[];
}

export function CsvUpload({ kind, label }: Props) {
  const { addPack } = usePacks();
  const template = TEMPLATES[kind];
  const [open, setOpen] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [name, setName] = React.useState('');
  const [outcome, setOutcome] = React.useState<Outcome | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const packName = name.trim() || file.name.replace(/\.csv$/i, '');
    const result = addPack(kind, packName, text);
    if (!result.ok) {
      setOutcome({ tone: 'negative', headline: result.fatal ?? 'Nothing could be read from that file.', errors: result.errors });
      return;
    }
    const skipped = result.errors.length;
    const noun = result.added === 1 ? 'item' : 'items';
    const head = 'Added ' + result.added + ' ' + noun + ' as "' + packName + '".';
    setOutcome({
      tone: 'positive',
      headline: skipped === 0
        ? head
        : head + ' ' + skipped + (skipped === 1 ? ' row was' : ' rows were') + ' skipped.',
      errors: result.errors,
    });
    setName('');
  };

  if (!open) {
    return (
      <ListSection>
        <ListRow
          title={label}
          symbol={<Icon name="plus" size={17} weight={2.5} />}
          symbolColor="var(--green)"
          accessory="chevron"
          onClick={() => setOpen(true)}
        />
      </ListSection>
    );
  }

  return (
    <Card padding="roomy" style={{ marginBottom: 'var(--space-7)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ flex: 1, font: 'var(--text-title-3)', letterSpacing: 'var(--tracking-title-3)' }}>{label}</h2>
        <Button variant="plain" size="small" onClick={() => setOpen(false)}>Done</Button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 'var(--space-3)' }}>
        {template.required.map(c => <Badge key={c} tone="info">{c}</Badge>)}
        {template.optional.map(c => <Badge key={c} tone="neutral">{c}</Badge>)}
      </div>
      <p style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-footnote)', marginBottom: 'var(--space-4)' }}>
        Blue columns are required, grey ones optional.
      </p>

      <ul style={{ listStyle: 'none', margin: '0 0 var(--space-5)', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[...template.notes, 'Comma or semicolon separated. A file saved from Excel on a Hungarian machine works as it is.'].map(n => (
          <li key={n} style={{ display: 'flex', gap: 'var(--space-2)', font: 'var(--text-subheadline)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-subheadline)' }}>
            <Icon name="checkmark" size={15} weight={2.5} style={{ color: 'var(--green)', marginTop: 3 }} />
            <span>{n}</span>
          </li>
        ))}
      </ul>

      <label htmlFor="pack-name" style={{ display: 'block', font: 'var(--text-footnote)', color: 'var(--label-secondary)', marginBottom: 6, letterSpacing: 'var(--tracking-footnote)' }}>
        Pack name, optional
      </label>
      <TextField
        id="pack-name" value={name} placeholder="The file name is used if you leave this empty"
        onChange={e => setName(e.target.value)}
        style={{ marginBottom: 'var(--space-4)' }}
      />

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault();
          setDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        style={{
          border: '2px dashed ' + (dragging ? 'var(--tint)' : 'var(--separator)'),
          background: dragging ? 'color-mix(in srgb, var(--tint) 8%, transparent)' : 'var(--fill-quaternary)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-6) var(--space-4)', textAlign: 'center',
          transition: 'background-color var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)',
        }}
      >
        <Icon name="upload" size={28} weight={1.8} style={{ color: 'var(--label-tertiary)', margin: '0 auto var(--space-3)' }} />
        <p style={{ font: 'var(--text-callout)', marginBottom: 'var(--space-4)', letterSpacing: 'var(--tracking-callout)' }}>
          Drop a CSV file here
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button size="small" onClick={() => inputRef.current?.click()}>Choose file</Button>
          <Button size="small" variant="gray" onClick={() => downloadCsv(template.filename, template.csv)} icon={<Icon name="download" size={15} weight={2.2} />}>
            Template
          </Button>
        </div>
        <input
          ref={inputRef} type="file" accept=".csv,text/csv" hidden
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {outcome && (
        <div style={{
          marginTop: 'var(--space-4)', padding: 'var(--space-4)',
          borderRadius: 'var(--radius-control)',
          background: outcome.tone === 'positive'
            ? 'color-mix(in srgb, var(--green) 12%, transparent)'
            : 'color-mix(in srgb, var(--red) 12%, transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <Badge tone={outcome.tone} solid>{outcome.tone === 'positive' ? 'Added' : 'Not added'}</Badge>
            <span style={{ font: 'var(--text-subheadline)', letterSpacing: 'var(--tracking-subheadline)' }}>{outcome.headline}</span>
          </div>
          {outcome.errors.length > 0 && (
            <ul style={{ listStyle: 'none', margin: 'var(--space-3) 0 0', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {outcome.errors.slice(0, 12).map((e, i) => (
                <li key={i} style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-footnote)' }}>
                  {e.line > 0 ? 'Line ' + e.line + ': ' : ''}{e.message}
                </li>
              ))}
              {outcome.errors.length > 12 && (
                <li style={{ font: 'var(--text-footnote)', color: 'var(--label-secondary)' }}>
                  and {outcome.errors.length - 12} more.
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}
