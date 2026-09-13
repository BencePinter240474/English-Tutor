/** Fisher-Yates, on a copy. The input array is never touched. */
export function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** A random sample of at most n items. */
export function sample<T>(input: readonly T[], n: number): T[] {
  return shuffle(input).slice(0, Math.max(0, n));
}
