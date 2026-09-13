/* Built-in content.

   The starter packs are real CSV files, in exactly the format an upload has
   to use, imported as raw text and parsed at startup. That keeps one code
   path for built-in and uploaded content, and it means the shipped files can
   be opened in a spreadsheet as worked examples. */

import everydayCsv from './vocab-everyday.csv?raw';
import travelCsv from './vocab-travel.csv?raw';
import grammarCsv from './grammar-basics.csv?raw';
import readingCsv from './reading-starter.csv?raw';

import { parseGrammarCsv, parseReadingCsv, parseVocabCsv } from '../lib/schemas';
import type { GrammarPack, ReadingPack, VocabPack } from '../lib/types';

export const BUILT_IN_VOCAB: VocabPack[] = [
  { id: 'builtin-vocab-everyday', kind: 'vocab', name: 'Everyday words', origin: 'built-in', items: parseVocabCsv(everydayCsv).items },
  { id: 'builtin-vocab-travel', kind: 'vocab', name: 'Travel and directions', origin: 'built-in', items: parseVocabCsv(travelCsv).items },
];

export const BUILT_IN_GRAMMAR: GrammarPack[] = [
  { id: 'builtin-grammar-basics', kind: 'grammar', name: 'Grammar basics', origin: 'built-in', items: parseGrammarCsv(grammarCsv).items },
];

export const BUILT_IN_READING: ReadingPack[] = [
  { id: 'builtin-reading-starter', kind: 'reading', name: 'Short texts', origin: 'built-in', items: parseReadingCsv(readingCsv).items },
];
