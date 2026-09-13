/* A small RFC 4180 CSV reader.

   Written by hand rather than pulled in as a dependency, because the job is
   narrow and the file stays readable. It handles the three things a real
   spreadsheet export throws at you: a UTF-8 byte order mark, CRLF endings,
   and quoted fields containing commas, newlines or doubled quotes.

   Delimiter is detected, not assumed. Excel on a Hungarian locale writes
   semicolons, so a file saved from a Hungarian machine parses as one column
   unless we look first. */

export type CsvRow = string[];

const DELIMITERS = [',', ';', '\t'] as const;

/** Count delimiters outside quotes on the first line, and take the winner. */
export function detectDelimiter(text: string): string {
  let line = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') inQuotes = !inQuotes;
    if (!inQuotes && (ch === '\n' || ch === '\r')) break;
    line += ch;
  }
  let best = ',';
  let bestCount = 0;
  for (const d of DELIMITERS) {
    let count = 0;
    let quoted = false;
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') quoted = !quoted;
      else if (!quoted && line[i] === d) count++;
    }
    if (count > bestCount) { best = d; bestCount = count; }
  }
  return best;
}

export interface RawRow {
  cells: string[];
  /** 1-based physical line the record starts on, counting blank lines. */
  line: number;
}

/**
 * Parse CSV text into rows, keeping each row's line number in the original
 * file. Blank lines are dropped from the output but still counted, so an
 * error message points at the row the learner will see in their spreadsheet.
 */
export function parseCsvRows(input: string, delimiter?: string): RawRow[] {
  const text = input.replace(/^\uFEFF/, '');
  const d = delimiter ?? detectDelimiter(text);
  const rows: RawRow[] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  let line = 1;
  let rowStart = 1;

  const endField = () => { row.push(field.trim()); field = ''; };
  const endRow = () => {
    endField();
    // A line of nothing but empty cells is padding, not data.
    if (row.some(c => c !== '')) rows.push({ cells: row, line: rowStart });
    row = [];
  };

  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      // A quoted field may span lines, and those lines still count.
      if (ch === '\n') line++;
      field += ch; i++; continue;
    }
    if (ch === '"' && field.trim() === '') { inQuotes = true; field = ''; i++; continue; }
    if (ch === d) { endField(); i++; continue; }
    if (ch === '\r') { i++; continue; }
    if (ch === '\n') { endRow(); line++; rowStart = line; i++; continue; }
    field += ch; i++;
  }
  if (field !== '' || row.length > 0) endRow();
  return rows;
}

/** Parse CSV text into rows of raw cell strings. */
export function parseCsv(input: string, delimiter?: string): CsvRow[] {
  return parseCsvRows(input, delimiter).map(r => r.cells);
}

export interface CsvTable {
  /** Header cells, lowercased and trimmed, in file order. */
  headers: string[];
  /** One record per data row, keyed by header. Missing cells read as ''. */
  records: Record<string, string>[];
  /** 1-based line number of each record, for error messages. */
  lines: number[];
}

/** Parse CSV text into header-keyed records. Throws if the file is empty. */
export function parseCsvTable(input: string): CsvTable {
  const rows = parseCsvRows(input);
  if (rows.length === 0) throw new Error('The file is empty.');
  const headers = rows[0].cells.map(h => h.trim().toLowerCase());
  const records: Record<string, string>[] = [];
  const lines: number[] = [];
  for (let r = 1; r < rows.length; r++) {
    const rec: Record<string, string> = {};
    headers.forEach((h, c) => { rec[h] = rows[r].cells[c] ?? ''; });
    records.push(rec);
    lines.push(rows[r].line);
  }
  return { headers, records, lines };
}

/**
 * Read the first non-empty value among a set of accepted column names, so a
 * sheet headed "magyar" works as well as one headed "hungarian".
 */
export function pick(rec: Record<string, string>, names: readonly string[]): string {
  for (const n of names) {
    const v = rec[n];
    if (v != null && v.trim() !== '') return v.trim();
  }
  return '';
}

/** Split a multi-value cell. Pipe is the documented separator; / is tolerated. */
export function splitList(value: string): string[] {
  if (value.trim() === '') return [];
  const sep = value.includes('|') ? '|' : '/';
  return value.split(sep).map(s => s.trim()).filter(s => s !== '');
}

/** Serialise rows back to CSV, quoting only where a cell needs it. */
export function toCsv(rows: CsvRow[]): string {
  const cell = (v: string) =>
    /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
  return rows.map(r => r.map(cell).join(',')).join('\r\n');
}

