/* Appearance: follow the system, or override it.

   Apple apps let the reader pin light or dark rather than always following
   the device, and this one does the same. The choice is written to the root
   element as a data attribute, which is what the token file keys off, and
   remembered in this browser. */

export type Appearance = 'system' | 'light' | 'dark';

const KEY = 'english-tutor:appearance:v1';

export function loadAppearance(): Appearance {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch { /* storage blocked */ }
  return 'system';
}

export function applyAppearance(value: Appearance) {
  const root = document.documentElement;
  if (value === 'system') root.removeAttribute('data-appearance');
  else root.setAttribute('data-appearance', value);
  try { localStorage.setItem(KEY, value); } catch { /* storage blocked */ }
}
