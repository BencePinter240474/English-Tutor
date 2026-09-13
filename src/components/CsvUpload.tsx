import React from 'react';
import { Badge, Button, Card, Field, Input, Tag } from '../design/components';
import { usePacks } from '../lib/packs';
import { TEMPLATES, downloadCsv } from '../lib/templates';
import type { PackKind, RowError } from '../lib/types';

/* Every exercise is extended the same way: drop a CSV in here.

   The panel is collapsed by default so it never competes with the exercise
   itself, and it always shows the exact column names the parser wants,
   because a failed upload with no explanation is worse than no upload. */

interface Props {
  kind: PackKind;
  /** Shown on the collapsed button, e.g. "Add your own words". */
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
    setOutcome({
      tone: 'positive',
      headline: skipped === 0
        ? `Added ${result.added} ${result.added === 1 ? 'item' : 'items'} as "${packName}".`
        : `Added ${result.added} ${result.added === 1 ? 'item' : 'items'} as "${packName}". ${skipped} ${skipped === 1 ? 'row was' : 'rows were'} skipped.`,
      errors: result.errors,
    });
    setName('');
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  if (!open) {
    return (
      <div style={{ marginTop: 'var(--space-5)' }}>
        <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>{label}</Button>
      </div>
    );
  }

  return (
    <Card
      tone="pale"
      title={label}
      actions={<Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Close</Button>}
      style={{ marginTop: 'var(--space-5)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center' }}>
          <span style={{ font: 'var(--type-label)', color: 'var(--bark)' }}>Required columns</span>
          {template.required.map(c => <Tag key={c}>{c}</Tag>)}
          <span style={{ font: 'var(--type-label)', color: 'var(--bark)', marginLeft: 'var(--space-3)' }}>Optional</span>
          {template.optional.map(c => <Tag key={c}>{c}</Tag>)}
        </div>

        <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', font: 'var(--type-caption)', color: 'var(--bark)' }}>
          {template.notes.map(n => <li key={n} style={{ marginBottom: 'var(--space-1)' }}>{n}</li>)}
          <li>Comma or semicolon separated. A file saved from Excel on a Hungarian machine works as it is.</li>
        </ul>

        <Field label="Pack name" hint="Optional. The file name is used if you leave this empty." htmlFor="pack-name">
          <Input
            id="pack-name" value={name} placeholder="e.g. Unit 4 words"
            onChange={e => setName(e.target.value)}
          />
        </Field>

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          style={{
            border: '1px dashed ' + (dragging ? 'var(--leaf)' : 'var(--border-strong)'),
            background: dragging ? 'var(--lime)' : 'var(--white)',
            padding: 'var(--space-6)', textAlign: 'center',
            transition: 'var(--transition-ui)',
          }}
        >
          <p style={{ font: 'var(--type-body)', marginBottom: 'var(--space-3)' }}>
            Drop a CSV file here, or choose one.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button size="sm" onClick={() => inputRef.current?.click()}>Choose file</Button>
            <Button
              size="sm" variant="secondary"
              onClick={() => downloadCsv(template.filename, template.csv)}
            >Download template</Button>
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
            borderLeft: 'var(--border-width-accent) solid ' + (outcome.tone === 'positive' ? 'var(--leaf)' : 'var(--graphite)'),
            background: outcome.tone === 'positive' ? 'var(--status-positive-bg)' : 'var(--status-negative-bg)',
            padding: 'var(--space-4)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: outcome.errors.length ? 'var(--space-3)' : 0 }}>
              <Badge tone={outcome.tone}>{outcome.tone === 'positive' ? 'Added' : 'Not added'}</Badge>
              <span style={{ font: 'var(--type-small)' }}>{outcome.headline}</span>
            </div>
            {outcome.errors.length > 0 && (
              <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', font: 'var(--type-caption)', color: 'var(--bark)' }}>
                {outcome.errors.slice(0, 12).map((e, i) => (
                  <li key={i}>{e.line > 0 ? `Line ${e.line}: ` : ''}{e.message}</li>
                ))}
                {outcome.errors.length > 12 && <li>and {outcome.errors.length - 12} more.</li>}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
