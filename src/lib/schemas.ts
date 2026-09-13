/* Reading an uploaded CSV into pack items.

   Column names are matched against a list of accepted spellings, so a sheet
   headed "magyar" or "hu" works the same as one headed "hungarian". Anything
   a row is missing is reported with its line number rather than silently
   dropped, because a learner who uploads 80 words should be told which four
   did not make it.

   Multi-value cells (the options on a question) are separated by a pipe. */

import { parseCsvTable, pick, splitList } from './csv';
import type {
  GrammarItem, ParseResult, ReadingPassage, ReadingQuestion, VocabItem,
} from './types';

const HUNGARIAN = ['hungarian', 'magyar', 'hu', 'hun'] as const;
const ENGLISH = ['english', 'angol', 'en', 'eng'] as const;
const EXAMPLE = ['example', 'sentence', 'pelda', 'példa'] as const;
const CATEGORY = ['category', 'topic', 'tema', 'téma', 'group'] as const;
const PROMPT = ['prompt', 'question', 'sentence', 'kerdes', 'kérdés'] as const;
const OPTIONS = ['options', 'choices', 'answers', 'valaszok', 'válaszok'] as const;
const ANSWER = ['answer', 'correct', 'correct_answer', 'megoldas', 'megoldás'] as const;
const EXPLANATION = ['explanation', 'note', 'why', 'magyarazat', 'magyarázat'] as const;
const LEVEL = ['level', 'cefr', 'szint'] as const;

let counter = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(counter++).toString(36)}`;

/** Options must contain the answer, or the question can never be got right. */
function checkAnswer(options: string[], answer: string, line: number, errors: { line: number; message: string }[]): boolean {
  if (options.length < 2) {
    errors.push({ line, message: 'Needs at least two options, separated by |.' });
    return false;
  }
  if (!options.some(o => o.toLowerCase() === answer.toLowerCase())) {
    errors.push({ line, message: `The answer "${answer}" is not one of the options.` });
    return false;
  }
  return true;
}

export function parseVocabCsv(text: string): ParseResult<VocabItem> {
  const { records, lines } = parseCsvTable(text);
  const items: VocabItem[] = [];
  const errors: { line: number; message: string }[] = [];
  records.forEach((rec, i) => {
    const line = lines[i];
    const hungarian = pick(rec, HUNGARIAN);
    const english = pick(rec, ENGLISH);
    if (!hungarian || !english) {
      errors.push({ line, message: 'Both a Hungarian and an English column are required.' });
      return;
    }
    items.push({
      id: nextId('v'),
      hungarian,
      english,
      example: pick(rec, EXAMPLE) || undefined,
      category: pick(rec, CATEGORY) || undefined,
    });
  });
  return { items, errors };
}

export function parseGrammarCsv(text: string): ParseResult<GrammarItem> {
  const { records, lines } = parseCsvTable(text);
  const items: GrammarItem[] = [];
  const errors: { line: number; message: string }[] = [];
  records.forEach((rec, i) => {
    const line = lines[i];
    const prompt = pick(rec, PROMPT);
    const options = splitList(pick(rec, OPTIONS));
    const answer = pick(rec, ANSWER);
    if (!prompt || !answer) {
      errors.push({ line, message: 'A prompt and an answer are required.' });
      return;
    }
    if (!checkAnswer(options, answer, line, errors)) return;
    items.push({
      id: nextId('g'),
      prompt,
      options,
      answer,
      explanation: pick(rec, EXPLANATION) || undefined,
      topic: pick(rec, CATEGORY) || undefined,
    });
  });
  return { items, errors };
}

/**
 * Reading is one row per QUESTION, grouped into passages by passage_id. The
 * passage text only has to appear on the first row of its group, so a three
 * question passage does not mean pasting the same paragraph three times.
 */
export function parseReadingCsv(text: string): ParseResult<ReadingPassage> {
  const { records, lines } = parseCsvTable(text);
  const errors: { line: number; message: string }[] = [];
  const byId = new Map<string, ReadingPassage>();
  const order: string[] = [];

  records.forEach((rec, i) => {
    const line = lines[i];
    const passageId = pick(rec, ['passage_id', 'passage', 'id', 'szoveg_id']);
    const passageTitle = pick(rec, ['passage_title', 'title', 'cim', 'cím']);
    const passageText = pick(rec, ['passage_text', 'text', 'szoveg', 'szöveg']);
    const question = pick(rec, PROMPT);
    const options = splitList(pick(rec, OPTIONS));
    const answer = pick(rec, ANSWER);

    if (!passageId) {
      errors.push({ line, message: 'A passage_id is required, so questions can be grouped.' });
      return;
    }
    if (!byId.has(passageId)) {
      if (!passageText) {
        errors.push({ line, message: `The first row of passage "${passageId}" must carry passage_text.` });
        return;
      }
      byId.set(passageId, {
        id: passageId,
        title: passageTitle || passageId,
        text: passageText,
        level: pick(rec, LEVEL) || undefined,
        questions: [],
      });
      order.push(passageId);
    }
    if (!question) return; // A passage row with no question is just the text.
    if (!answer) {
      errors.push({ line, message: 'A question row needs an answer.' });
      return;
    }
    if (!checkAnswer(options, answer, line, errors)) return;
    const q: ReadingQuestion = {
      id: nextId('q'),
      question,
      options,
      answer,
      explanation: pick(rec, EXPLANATION) || undefined,
    };
    byId.get(passageId)!.questions.push(q);
  });

  const items: ReadingPassage[] = [];
  for (const id of order) {
    const p = byId.get(id)!;
    if (p.questions.length === 0) {
      errors.push({ line: 0, message: `Passage "${p.title}" has no usable questions, so it was skipped.` });
      continue;
    }
    items.push(p);
  }
  return { items, errors };
}
