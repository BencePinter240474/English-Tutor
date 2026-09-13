/* Everything the learner adds lives in this browser.

   The site is static and has no server, so uploaded packs and progress are
   kept in localStorage. Reads are defensive: a corrupted or hand-edited value
   must not take the app down, so a bad parse falls back to the default and
   the key is left alone for inspection. */

const PACKS_KEY = 'english-tutor:packs:v2';
const STATS_KEY = 'english-tutor:stats:v1';

import type { Pack } from './types';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Quota exceeded, or storage blocked in a private window.
    return false;
  }
}

export function loadUploadedPacks(): Pack[] {
  const packs = read<Pack[]>(PACKS_KEY, []);
  return Array.isArray(packs) ? packs : [];
}

export function saveUploadedPacks(packs: Pack[]): boolean {
  return write(PACKS_KEY, packs);
}

/* Progress. One record per exercise, holding the last result and a running
   total, which is enough to show "you did this, here is how it went" without
   pretending to be a spaced repetition scheduler. */

export interface ExerciseStat {
  runs: number;
  lastScore?: number;
  lastTotal?: number;
  lastAt?: string;
  /** Best correct/total ratio seen, so rounds of different lengths compare. */
  bestRatio?: number;
}

export type Stats = Record<string, ExerciseStat>;

export function loadStats(): Stats {
  const s = read<Stats>(STATS_KEY, {});
  return s && typeof s === 'object' ? s : {};
}

export function recordRun(exercise: string, score: number, total: number): Stats {
  const stats = loadStats();
  const prev = stats[exercise] ?? { runs: 0 };
  const ratio = total > 0 ? score / total : 0;
  stats[exercise] = {
    runs: prev.runs + 1,
    lastScore: score,
    lastTotal: total,
    lastAt: new Date().toISOString(),
    bestRatio: Math.max(ratio, prev.bestRatio ?? 0),
  };
  write(STATS_KEY, stats);
  return stats;
}

export function clearStats(): Stats {
  try { localStorage.removeItem(STATS_KEY); } catch { /* ignore */ }
  return {};
}
