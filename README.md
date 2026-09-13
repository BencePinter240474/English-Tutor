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

The interface is built on an **Apple Human Interface Guidelines** design
system, written for this project and living in `src/design/`.

- `src/design/tokens/` the system colour palette with its semantic names, the
  eleven iOS text styles, the 4pt grid and its radii, and the motion curves.
- `src/design/components/` the controls: buttons, inset grouped lists, the
  navigation bar, tab bar, segmented control, badges, fields and progress.

What that means in practice: the app is a three tab iOS app. Practise lists
the exercises, Library holds the packs and uploads, Progress holds the scores.
Screens are inset grouped lists on a grey ground. The navigation bar and tab
bar are materials that blur what scrolls under them. Controls dip to 96% on
press and return on a spring, and the flashcard turns over in three
dimensions.

**Light and dark are one definition.** Every colour is a semantic token, so
the dark appearance is a token swap and no component knows which one is
showing. It follows the device by default, and Library has an Appearance
control to pin one.

### Nothing proprietary is redistributed

- **San Francisco** is referenced through the system font stack
  (`-apple-system`, `BlinkMacSystemFont`, `SF Pro Text`). On a Mac, iPhone or
  iPad that resolves to the real face; everywhere else it falls back to the
  host's own UI font. No font files are shipped, because SF is licensed for
  use on Apple platforms.
- **SF Symbols** are likewise licensed for Apple platforms, so `Icon.tsx` is a
  small hand-drawn set in the same idiom: a 24 grid, rounded caps and joins,
  uniform stroke. Swap it for a licensed set if this ever runs natively.

## Layout

```
src/
  content/     starter packs, as CSV files in the upload format
  design/      the Apple design system, tokens and components
  lib/         CSV reading, pack storage, templates
  components/  app shell, screen frame, upload panel, shared pieces
  exercises/   Flashcards, Matching, Grammar, Reading
  pages/       Practise, Library, Progress
```
