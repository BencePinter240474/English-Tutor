import React from 'react';
import { Badge, Button, Card, ListRow, ListSection, SegmentedControl } from '../design/components';
import { CsvUpload } from '../components/CsvUpload';
import { Screen } from '../components/Screen';
import { usePacks } from '../lib/packs';
import { TEMPLATES, downloadCsv } from '../lib/templates';
import type { Pack, PackKind } from '../lib/types';
import { applyAppearance, loadAppearance } from '../lib/appearance';
import type { Appearance } from '../lib/appearance';

/* The Library tab: everything the exercises draw on, in one place.

   A segmented control switches between the three kinds rather than stacking
   all three, because the CSV format below is per kind and showing three of
   them at once would bury the one being looked at. */

const KIND_LABEL: Record<PackKind, string> = { vocab: 'Words', grammar: 'Grammar', reading: 'Reading' };
const PACK_HEADER: Record<PackKind, string> = {
  vocab: 'Word packs',
  grammar: 'Grammar packs',
  reading: 'Reading packs',
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

export function Library() {
  const { vocab, grammar, reading, removePack, storageBlocked } = usePacks();
  const [kind, setKind] = React.useState<PackKind>('vocab');
  const [appearance, setAppearance] = React.useState<Appearance>(() => loadAppearance());

  const byKind: Record<PackKind, Pack[]> = { vocab, grammar, reading };
  const packs = byKind[kind];
  const template = TEMPLATES[kind];

  return (
    <Screen title="Library" large>
      <SegmentedControl
        segments={(Object.keys(KIND_LABEL) as PackKind[]).map(k => ({ value: k, label: KIND_LABEL[k] }))}
        value={kind}
        onChange={v => setKind(v as PackKind)}
        style={{ marginBottom: 'var(--space-6)' }}
      />

      {storageBlocked && (
        <Card padding="regular" style={{ marginBottom: 'var(--space-6)', background: 'color-mix(in srgb, var(--red) 12%, transparent)' }}>
          <Badge tone="negative" solid>Not saved</Badge>
          <p style={{ font: 'var(--text-subheadline)', marginTop: 'var(--space-2)', letterSpacing: 'var(--tracking-subheadline)' }}>
            This browser refused to store the upload, which usually means a private window or a full
            storage quota. The pack works for this visit but will be gone when the tab closes.
          </p>
        </Card>
      )}

      <ListSection
        header={PACK_HEADER[kind]}
        footer="Built-in packs ship with the site. Uploads are held in this browser, so clearing site data removes them."
      >
        {packs.map(pack => (
          <ListRow
            key={pack.id}
            title={pack.name}
            subtitle={countLabel(pack)}
            value={pack.origin === 'uploaded'
              ? <Button variant="plain" size="small" destructive onClick={() => removePack(pack.id)}>Remove</Button>
              : <Badge tone="neutral">Built in</Badge>}
          />
        ))}
      </ListSection>

      <CsvUpload kind={kind} label={UPLOAD_LABEL[kind]} />

      <ListSection header="Appearance" footer="Light and dark follow this device unless you pin one.">
        <div style={{ padding: 'var(--space-3) var(--space-4)' }}>
          <SegmentedControl
            segments={[
              { value: 'system', label: 'System' },
              { value: 'light', label: 'Light' },
              { value: 'dark', label: 'Dark' },
            ]}
            value={appearance}
            onChange={v => {
              const next = v as Appearance;
              setAppearance(next);
              applyAppearance(next);
            }}
          />
        </div>
      </ListSection>

      <ListSection header="CSV format">
        <div style={{ padding: 'var(--space-4)' }}>
          <p style={{ font: 'var(--text-subheadline)', color: 'var(--label-secondary)', letterSpacing: 'var(--tracking-subheadline)', marginBottom: 'var(--space-3)' }}>
            Any spreadsheet can save this: File, then Save as, then CSV.
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-control)', background: 'var(--fill-quaternary)' }}>
            <pre style={{
              font: 'var(--text-caption-1)', fontFamily: 'var(--font-mono)',
              margin: 0, padding: 'var(--space-3)', whiteSpace: 'pre',
              color: 'var(--label-secondary)',
            }}>{template.csv.trimEnd()}</pre>
          </div>
          <div style={{ marginTop: 'var(--space-4)' }}>
            <Button variant="tinted" size="small" onClick={() => downloadCsv(template.filename, template.csv)}>
              Download the {KIND_LABEL[kind].toLowerCase()} template
            </Button>
          </div>
        </div>
      </ListSection>
    </Screen>
  );
}
