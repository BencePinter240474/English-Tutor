/* The pack store.

   Built-in packs come from src/content. Uploaded packs come from the
   learner's own CSV files and live in localStorage. Both are exposed the
   same way, so an exercise never needs to know where its material came from.
   Extending an exercise is always the same act: upload a CSV for that kind. */

import React from 'react';
import { BUILT_IN_GRAMMAR, BUILT_IN_READING, BUILT_IN_VOCAB } from '../content';
import { parseGrammarCsv, parseReadingCsv, parseVocabCsv } from './schemas';
import { loadUploadedPacks, saveUploadedPacks } from './storage';
import type {
  GrammarPack, Pack, PackKind, ReadingPack, RowError, VocabPack,
} from './types';

export interface AddPackResult {
  ok: boolean;
  added: number;
  errors: RowError[];
  /** Set when nothing could be read at all. */
  fatal?: string;
}

interface PacksApi {
  vocab: VocabPack[];
  grammar: GrammarPack[];
  reading: ReadingPack[];
  uploaded: Pack[];
  addPack: (kind: PackKind, name: string, csvText: string) => AddPackResult;
  removePack: (id: string) => void;
  /** True when a save was refused, e.g. storage is full or blocked. */
  storageBlocked: boolean;
}

const PacksContext = React.createContext<PacksApi | null>(null);

let uploadCounter = 0;
const nextPackId = () => `up-${Date.now().toString(36)}-${(uploadCounter++).toString(36)}`;

export function PacksProvider({ children }: { children: React.ReactNode }) {
  const [uploaded, setUploaded] = React.useState<Pack[]>(() => loadUploadedPacks());
  const [storageBlocked, setStorageBlocked] = React.useState(false);

  const persist = React.useCallback((next: Pack[]) => {
    setUploaded(next);
    setStorageBlocked(!saveUploadedPacks(next));
  }, []);

  const addPack = React.useCallback((kind: PackKind, name: string, csvText: string): AddPackResult => {
    let items: Pack['items'];
    let errors: RowError[];
    try {
      if (kind === 'vocab') {
        const r = parseVocabCsv(csvText); items = r.items; errors = r.errors;
      } else if (kind === 'grammar') {
        const r = parseGrammarCsv(csvText); items = r.items; errors = r.errors;
      } else {
        const r = parseReadingCsv(csvText); items = r.items; errors = r.errors;
      }
    } catch (e) {
      return { ok: false, added: 0, errors: [], fatal: e instanceof Error ? e.message : 'The file could not be read.' };
    }
    if (items.length === 0) {
      return {
        ok: false, added: 0, errors,
        fatal: 'No usable rows were found. Check the column names against the template.',
      };
    }
    const pack: Pack = {
      id: nextPackId(), kind, name: name || 'Uploaded pack',
      origin: 'uploaded', addedAt: new Date().toISOString(), items,
    };
    persist([...loadUploadedPacks(), pack]);
    return { ok: true, added: items.length, errors };
  }, [persist]);

  const removePack = React.useCallback((id: string) => {
    persist(loadUploadedPacks().filter(p => p.id !== id));
  }, [persist]);

  const value = React.useMemo<PacksApi>(() => ({
    vocab: [...BUILT_IN_VOCAB, ...uploaded.filter(p => p.kind === 'vocab') as VocabPack[]],
    grammar: [...BUILT_IN_GRAMMAR, ...uploaded.filter(p => p.kind === 'grammar') as GrammarPack[]],
    reading: [...BUILT_IN_READING, ...uploaded.filter(p => p.kind === 'reading') as ReadingPack[]],
    uploaded,
    addPack,
    removePack,
    storageBlocked,
  }), [uploaded, addPack, removePack, storageBlocked]);

  return <PacksContext.Provider value={value}>{children}</PacksContext.Provider>;
}

export function usePacks(): PacksApi {
  const ctx = React.useContext(PacksContext);
  if (!ctx) throw new Error('usePacks must be used inside a PacksProvider.');
  return ctx;
}
