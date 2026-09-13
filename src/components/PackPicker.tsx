import { ListRow, ListSection } from '../design/components';
import type { Pack } from '../lib/types';

/* Which packs feed this round. Multi-select the iOS way: rows in a grouped
   list, each with a checkmark when it is in. The last one in cannot be
   removed, because a round with nothing to draw from is not a round. */

interface Props {
  packs: Pack[];
  selected: string[];
  onChange: (ids: string[]) => void;
  itemNoun: string;
  footer?: string;
}

export function PackPicker({ packs, selected, onChange, itemNoun, footer }: Props) {
  const toggle = (id: string) => {
    const next = selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id];
    if (next.length > 0) onChange(next);
  };

  return (
    <ListSection header="Packs in this round" footer={footer}>
      {packs.map(pack => (
        <ListRow
          key={pack.id}
          title={pack.name}
          subtitle={pack.items.length + ' ' + itemNoun}
          accessory={selected.includes(pack.id) ? 'checkmark' : 'none'}
          onClick={() => toggle(pack.id)}
        />
      ))}
    </ListSection>
  );
}
