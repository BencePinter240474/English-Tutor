import React from 'react';
import { Badge, Button, Card, SectionHeading, Tabs } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { usePacks } from '../lib/packs';
import { TEMPLATES, downloadCsv } from '../lib/templates';
import { clearStats, loadStats } from '../lib/storage';
import type { Pack, PackKind } from '../lib/types';

/* Packs.

   One place to see everything loaded, add more, and take an upload back out
   again. Built-in packs cannot be deleted, because they are files in the
   repository rather than rows in this browser. */

const KIND_LABEL: Record<PackKind, string> = {
  vocab: 'Words',
  grammar: 'Grammar',
  reading: 'Reading',
};

const UPLOAD_LABEL: Record<PackKind, string> = {
  vocab: 'Add your own words',
  grammar: 'Add your own questions',
  reading: 'Add your own texts',
};

function countLabel(pack: Pack): string {
  const n = pack.items.length;
  if (pack.kind === 'vocab') return n + (n === 1 ? ' word' : ' words');
  if (pack.kind === 'grammar') return n + (n === 1 ? ' question' : ' questions');
  const qs = (pack.items as { questions: unknown[] }[]).reduce((t, p) => t + p.questions.length, 0);
  return n + (n === 1 ? ' text, ' : ' texts, ') + qs + (qs === 1 ? ' question' : ' questions');
}

export function Packs() {
  const { vocab, grammar, reading, removePack, storageBlocked } = usePacks();
  const [kind, setKind] = React.useState<PackKind>('vocab');
  const [stats, setStats] = React.useState(() => loadStats());

  const packsByKind: Record<PackKind, Pack[]> = { vocab, grammar, reading };
  const packs = packsByKind[kind];
  const template = TEMPLATES[kind];

  return (
    <div>
      <SectionHeading
        level={1}
        eyebrow="Material"
        note="Everything the exercises draw on. Uploads are held in this browser only, so clearing site data removes them."
      >Your packs</SectionHeading>

      {storageBlocked && (
        <div style={{
          marginTop: 'var(--space-5)', padding: 'var(--space-4)',
          borderLeft: 'var(--border-width-accent) solid var(--graphite)', background: 'var(--surface-pale)',
        }}>
          <Badge tone="negative">Not saved</Badge>
          <p style={{ font: 'var(--type-small)', marginTop: 'var(--space-2)' }}>
            This browser refused to store the upload, which usually means a private window or a full storage quota.
            The pack works for this visit but will be gone when the tab closes.
          </p>
        </div>
      )}

      <div style={{ marginTop: 'var(--space-6)' }}>
        <Tabs
          value={kind}
          onChange={v => setKind(v as PackKind)}
          tabs={(Object.keys(KIND_LABEL) as PackKind[]).map(k => ({
            value: k, label: KIND_LABEL[k], count: packsByKind[k].length,
          }))}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
        {packs.map(pack => (
          <Card
            key={pack.id}
            title={pack.name}
            eyebrow={countLabel(pack)}
            actions={pack.origin === 'uploaded'
              ? <Button variant="ghost" size="sm" onClick={() => removePack(pack.id)}>Remove</Button>
              : <Badge tone="neutral">Built in</Badge>}
            footnote={pack.addedAt ? 'Added ' + new Date(pack.addedAt).toLocaleDateString('en-GB') : undefined}
          />
        ))}
      </div>

      <CsvUpload kind={kind} label={UPLOAD_LABEL[kind]} />

      <div style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeading level={2} note={'The ' + KIND_LABEL[kind].toLowerCase() + ' format, in full. Any spreadsheet can save this: File, then Save as, then CSV.'}>
          CSV format
        </SectionHeading>
        <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ overflowX: 'auto' }}>
            <pre style={{
              font: 'var(--type-mono)', fontSize: 12, background: 'var(--surface-pale)',
              border: '1px solid var(--border-pale)', padding: 'var(--space-4)', margin: 0,
              whiteSpace: 'pre', color: 'var(--text-body)',
            }}>{template.csv.trimEnd()}</pre>
          </div>
          <div>
            <Button variant="secondary" size="sm" onClick={() => downloadCsv(template.filename, template.csv)}>
              Download the {KIND_LABEL[kind].toLowerCase()} template
            </Button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-8)' }}>
        <SectionHeading level={2} note="Scores are kept in this browser and are not sent anywhere.">
          Progress
        </SectionHeading>
        <div style={{ marginTop: 'var(--space-4)' }}>
          {Object.keys(stats).length === 0 ? (
            <p style={{ font: 'var(--type-small)', color: 'var(--bark)' }}>No rounds finished yet.</p>
          ) : (
            <>
              <ul style={{ margin: '0 0 var(--space-5)', padding: 0, listStyle: 'none' }}>
                {Object.entries(stats).map(([key, s]) => (
                  <li key={key} style={{
                    display: 'flex', justifyContent: 'space-between', gap: 'var(--space-4)',
                    borderTop: '1px solid var(--border-hairline)', padding: 'var(--space-3) 0',
                    font: 'var(--type-small)',
                  }}>
                    <span style={{ textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ color: 'var(--bark)', fontVariantNumeric: 'tabular-nums' }}>
                      {s.runs} {s.runs === 1 ? 'round' : 'rounds'}
                      {s.lastScore != null && s.lastTotal != null ? ', last ' + s.lastScore + ' of ' + s.lastTotal : ''}
                    </span>
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="sm" onClick={() => setStats(clearStats())}>Clear progress</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
