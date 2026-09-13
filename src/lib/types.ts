/* The content model.

   Every exercise reads from a PACK. A pack is either built in (shipped as a
   CSV in src/content) or uploaded by the learner, and the two are the same
   shape, so an uploaded pack is a first-class citizen rather than an extra.

   There are three pack kinds. Flashcards and matching both read vocab packs,
   which is why the same upload extends both at once. */

export type PackKind = 'vocab' | 'grammar' | 'reading';

export interface VocabItem {
  id: string;
  hungarian: string;
  english: string;
  /** An English example sentence, shown on the back of a flashcard. */
  example?: string;
  category?: string;
}

export interface GrammarItem {
  id: string;
  /** The sentence or question. A gap is written as ___ in the CSV. */
  prompt: string;
  options: string[];
  answer: string;
  explanation?: string;
  topic?: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  text: string;
  level?: string;
  questions: ReadingQuestion[];
}

export type PackItem = VocabItem | GrammarItem | ReadingPassage;

export interface Pack<T extends PackItem = PackItem> {
  id: string;
  kind: PackKind;
  name: string;
  origin: 'built-in' | 'uploaded';
  /** ISO date, uploaded packs only. */
  addedAt?: string;
  items: T[];
}

export type VocabPack = Pack<VocabItem>;
export type GrammarPack = Pack<GrammarItem>;
export type ReadingPack = Pack<ReadingPassage>;

/** One problem found while reading an uploaded file. */
export interface RowError {
  line: number;
  message: string;
}

export interface ParseResult<T extends PackItem> {
  items: T[];
  errors: RowError[];
}
