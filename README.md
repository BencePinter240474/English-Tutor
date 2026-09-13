# English practice

A static website for practising English, built for a Hungarian speaker. Four
exercises, and every one of them can be extended by uploading a CSV.

- **Flashcards** Hungarian on one side, English on the other. Cards you do not
  know come back at the end of the round.
- **Matching pairs** a memory board. Turn two tiles over and pair the Hungarian
  word with its English translation.
- **Grammar** multiple choice, marked as you go, with an explanation after
  every answer.
- **Reading** short texts with comprehension questions. The text stays on
  screen while you answer.

Nothing is sent anywhere. Uploaded packs and scores live in the browser's
`localStorage`, which also means clearing site data removes them.

## Running it

```
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle into dist/
npm run preview  # serve the built bundle
```

## Deploying

Pushing to `main` builds the site and publishes it through
`.github/workflows/deploy.yml`.

**One-time setup:** in the repository, go to Settings, then Pages, and set
**Source** to **GitHub Actions**. Without that the workflow builds and then
fails at the deploy step.

The site is served from a subpath, so `vite.config.ts` sets
`base: '/English-Tutor/'` for production builds. Rename the repository and that
value has to change with it. Routing is hash based for the same reason: a
static host has no rewrite rule, so `/#/grammar` survives a hard refresh where
`/grammar` would 404.

## Adding material

Every exercise has an **Add your own** panel, and the Your packs page collects
all three in one place. Each panel names the columns it needs, shows a worked
example, and offers a template to download.

Files are read leniently on purpose:

- Comma, semicolon or tab separated. A sheet saved from Excel on a Hungarian
  machine uses semicolons and works as it is.
- A UTF-8 byte order mark and CRLF line endings are both handled.
- Column names are matched against several spellings, so `magyar`, `hu` and
  `hungarian` are the same column, as are `angol` and `english`.
- A row that cannot be read is reported with its line number rather than
  dropped in silence, so it can be found in the spreadsheet.

### Words, used by Flashcards and Matching pairs

| Column | |
| --- | --- |
| `hungarian` | required, also `magyar` or `hu` |
| `english` | required, also `angol` or `en` |
| `example` | optional, an English sentence shown on the back of the card |
| `category` | optional, shown as a label |

### Grammar

| Column | |
| --- | --- |
| `prompt` | required, write the gap as three underscores: `___` |
| `options` | required, separated by a pipe: `go\|goes\|going` |
| `answer` | required, must match one of the options exactly |
| `explanation` | optional, shown after the answer |
| `topic` | optional, shown as a label |

### Reading

One row per question. Rows sharing a `passage_id` belong to the same text, and
only the first row of a passage needs to carry `passage_text`.

| Column | |
| --- | --- |
| `passage_id` | required, groups questions into one text |
| `passage_text` | required on the first row of each passage |
| `question` | required |
| `options` | required, pipe separated |
| `answer` | required, must match one of the options |
| `passage_title` | optional |
| `level` | optional, for example B1 |
| `explanation` | optional |

## The design system

The interface is built with the **elho design system**, internal mode, pulled
from the elho Design System project on claude.ai/design.

- `src/design/tokens/` the colour, type, spacing, elevation and motion tokens,
  copied as they are.
- `src/design/components/` the components used here, converted from the
  project's `.jsx` sources to typed `.tsx`. Divergences from the source are
  noted in the file that makes them.

The rules that shape the look: internal mode uses seven of the thirteen brand
colours (White, Linen, Graphite, Leaf, Lime, Pebble, Bark); text is Graphite or
white and never coloured, so right and wrong are said in words in a badge
rather than signalled in red and green; containers are square and flat, and a
9px corner marks something interactive; emphasis moves up the value ladder
Graphite, Leaf, Pebble, Lime rather than changing hue.

### The typeface is not shipped

The brand face is Cina GEO. The cuts held in the design system project are the
free `CinaGEOTest` trial files, licensed for personal use only, so publishing
them with a public site would breach that licence. They are deliberately absent
and the fallback stack carries the type instead. See `public/fonts/README.md`
for how to switch the real face on once the Public Type licence is bought.

## Layout

```
src/
  content/     starter packs, as CSV files in the upload format
  design/      the elho design system, tokens and components
  lib/         CSV reading, pack storage, templates
  components/  app shell, upload panel, shared pieces
  exercises/   Flashcards, Matching, Grammar, Reading
  pages/       Home, Your packs
```
