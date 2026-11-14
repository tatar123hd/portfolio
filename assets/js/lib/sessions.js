// Course session generator: N sessions, every K weeks, each L days long.
import { addDays, isIsoDate } from './dates.js';

const MAX_SESSIONS = 52;
const whole = (v, fallback) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Math.floor(Number(v)) : fallback);

export function generateSessions({ start, everyWeeks, count, lengthDays }) {
  if (!isIsoDate(start)) return [];
  const n = Math.min(MAX_SESSIONS, whole(count, 0));
  const step = Math.max(1, whole(everyWeeks, 1)) * 7;
  const len = Math.max(1, whole(lengthDays, 1));
  const sessions = [];
  for (let i = 0; i < n; i++) {
    const s = addDays(start, i * step);
    sessions.push({ start: s, end: addDays(s, len - 1) });
  }
  return sessions;
}

// Keep only sessions that sit fully inside the timeline range.
export const clipSessions = (sessions, range) => sessions.filter((s) => s.start >= range.min && s.end <= range.max);
