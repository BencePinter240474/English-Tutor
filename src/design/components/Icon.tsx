import type { CSSProperties } from 'react';

/* Icons in the SF Symbols idiom: drawn on a 24 grid with rounded caps and
   joins, uniform stroke, and no detail that would not survive at 17px.

   SF Symbols themselves are licensed for Apple platforms and cannot ship
   with a web app, so this is a small hand-drawn set covering only what the
   app actually uses. Every glyph inherits currentColor, so an icon in a row
   takes the row's ink and an icon in a filled button takes the button's. */

const PATHS: Record<string, string> = {
  'chevron-right': 'M9 5l7 7-7 7',
  'chevron-left': 'M15 5l-7 7 7 7',
  'chevron-down': 'M5 9l7 7 7-7',
  checkmark: 'M4.5 12.5l5 5 10-11',
  xmark: 'M6 6l12 12M18 6L6 18',
  plus: 'M12 5v14M5 12h14',
  cards: 'M7 8h13a1 1 0 011 1v9a1 1 0 01-1 1H7a1 1 0 01-1-1V9a1 1 0 011-1zM4 15V6a1 1 0 011-1h12',
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  book: 'M4 5.5A1.5 1.5 0 015.5 4H18a1 1 0 011 1v13a1 1 0 01-1 1H5.5A1.5 1.5 0 004 20.5zM4 17.5A1.5 1.5 0 015.5 16H19',
  text: 'M5 6h14M5 12h14M5 18h9',
  library: 'M5 4v16M10 4v16M15.5 4.8l4 15.2',
  chart: 'M5 19V11M12 19V5M19 19v-6M3.5 19h17',
  upload: 'M12 16V4M8 8l4-4 4 4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3',
  download: 'M12 4v12M8 12l4 4 4-4M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3',
  trash: 'M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 12a1 1 0 001 1h8a1 1 0 001-1l1-12',
  refresh: 'M20 12a8 8 0 11-2.6-5.9M20 4v4h-4',
  doc: 'M7 3h7l5 5v13a1 1 0 01-1 1H7a1 1 0 01-1-1V4a1 1 0 011-1zM14 3v5h5',
  flip: 'M4 9a8 8 0 0113.5-3M20 15A8 8 0 016.5 18M17 3v3.5h-3.5M7 21v-3.5h3.5',
  clock: 'M12 7v5l3.5 2M12 21a9 9 0 110-18 9 9 0 010 18z',
  sparkle: 'M12 4l1.9 5.1L19 11l-5.1 1.9L12 18l-1.9-5.1L5 11l5.1-1.9z',
};

export type IconName = keyof typeof PATHS | string;

export interface IconProps {
  name: IconName;
  size?: number;
  /** Stroke weight, matching SF Symbols' weight axis. */
  weight?: number;
  style?: CSSProperties;
}

export function Icon({ name, size = 17, weight = 2, style }: IconProps) {
  const d = PATHS[name];
  if (!d) return null;
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={weight}
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
      style={{ flex: 'none', display: 'block', ...style }}
    >
      {d.split('M').filter(Boolean).map((seg, i) => <path key={i} d={'M' + seg} />)}
    </svg>
  );
}
