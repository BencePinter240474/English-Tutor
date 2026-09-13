/* Downloadable CSV templates, one per pack kind.

   These double as the documentation: the header row names every column and
   the sample rows show the pipe separated options and the ___ gap marker.
   Kept as plain strings so a template is always in step with the parser that
   reads it back. */

import type { PackKind } from './types';

export interface Template {
  kind: PackKind;
  filename: string;
  /** Columns the parser insists on. */
  required: string[];
  /** Columns it will use if present. */
  optional: string[];
  notes: string[];
  csv: string;
}

export const TEMPLATES: Record<PackKind, Template> = {
  vocab: {
    kind: 'vocab',
    filename: 'vocabulary-template.csv',
    required: ['hungarian', 'english'],
    optional: ['example', 'category'],
    notes: [
      'One word or expression per row.',
      'The Hungarian column may also be headed magyar or hu, the English one angol or en.',
      'Used by both Flashcards and Matching pairs.',
    ],
    csv: [
      'hungarian,english,example,category',
      'alma,apple,She packed an apple for lunch.,food',
      'vonat,train,The train leaves at half past six.,travel',
      'megbizhato,reliable,He is a reliable colleague.,adjectives',
      '"nincs mit","you are welcome","Thanks for helping. You are welcome.",phrases',
    ].join('\r\n') + '\r\n',
  },
  grammar: {
    kind: 'grammar',
    filename: 'grammar-template.csv',
    required: ['prompt', 'options', 'answer'],
    optional: ['explanation', 'topic'],
    notes: [
      'Write the gap in the sentence as three underscores: ___',
      'Separate the options with a pipe: a|b|c',
      'The answer must match one of the options exactly.',
    ],
    csv: [
      'prompt,options,answer,explanation,topic',
      'She ___ to school every day.,go|goes|going,goes,"Third person singular takes an s in the present simple.",present simple',
      'I ___ never been to Spain.,have|has|had,have,"Present perfect with I always takes have.",present perfect',
      'This is ___ book I told you about.,a|an|the,the,"The is used for something already known to the listener.",articles',
    ].join('\r\n') + '\r\n',
  },
  reading: {
    kind: 'reading',
    filename: 'reading-template.csv',
    required: ['passage_id', 'passage_text', 'question', 'options', 'answer'],
    optional: ['passage_title', 'level', 'explanation'],
    notes: [
      'One row per question. Rows sharing a passage_id belong to the same text.',
      'Only the first row of a passage needs passage_text. Leave it empty afterwards.',
      'Separate the options with a pipe: a|b|c',
    ],
    csv: [
      'passage_id,passage_title,passage_text,level,question,options,answer,explanation',
      'p1,The night shift,"Mara works nights at a bakery. She starts at eleven and finishes at seven, when the first customers arrive. She says the quiet hours suit her.",B1,When does Mara finish work?,At eleven|At seven|At midnight,At seven,"The text says she finishes at seven."',
      'p1,,,,Why does Mara like the job?,The pay|The quiet hours|The customers,The quiet hours,"She says the quiet hours suit her."',
    ].join('\r\n') + '\r\n',
  },
};

/** Hand the browser a CSV file without a round trip to a server. */
export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
