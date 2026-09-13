import { ChoiceChip } from '../design/components';
import type { Pack } from '../lib/types';

/* Which packs feed this round. Multi-select, because the point of uploading
   a new list is being able to practise it next to the old one. */

interface Props {
  packs: Pack[];
  selected: string[];
  onChange: (ids: string[]) => void;
  itemNoun: string;
}

export function PackPicker({ packs, selected, onChange, itemNoun }: Props) {
  const toggle = (id: string, next: boolean) => {
    const ids = next ? [...selected, id] : selected.filter(s => s !== id);
    // Never leave the round with nothing to draw from.
    onChange(ids.length === 0 ? selected : ids);
  };
  return (
    <div>
      <p style={{ font: 'var(--type-label)', color: 'var(--bark)', marginBottom: 'var(--space-2)' }}>
        Packs in this round
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        {packs.map(p => (
          <ChoiceChip
            key={p.id}
            selected={selected.includes(p.id)}
            onToggle={next => toggle(p.id, next)}
          >
            {p.name}
            <span style={{ font: 'var(--type-caption)', opacity: 0.8, marginLeft: 8 }}>
              {p.items.length} {itemNoun}
            </span>
          </ChoiceChip>
        ))}
      </div>
    </div>
  );
}
