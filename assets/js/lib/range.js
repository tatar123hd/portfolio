// Moving and resizing inclusive date ranges inside fixed bounds.
import { toDay, fromDay } from './dates.js';

const span = (r) => [toDay(r.start), toDay(r.end)];
const out = (s, e) => ({ start: fromDay(s), end: fromDay(e) });

export function moveRange(range, deltaDays, bounds) {
  const [s, e] = span(range);
  const [min, max] = span({ start: bounds.min, end: bounds.max });
  const len = e - s;
  const start = Math.max(min, Math.min(max - len, s + deltaDays));
  return out(start, start + len);
}

export function resizeRange(range, edge, deltaDays, bounds) {
  let [s, e] = span(range);
  const [min, max] = span({ start: bounds.min, end: bounds.max });
  if (edge === 'start') s = Math.max(min, Math.min(e, s + deltaDays));
  else e = Math.min(max, Math.max(s, e + deltaDays));
  return out(s, e);
}

// Pixel box for a bar. Short items get a minimum width so they can still be grabbed,
// and lose their resize handles when there is no room for both handles and a grab area.
const MIN_BAR = 24;
const HANDLES_FROM = 40;
export function barGeometry(range, min, dayW) {
  const left = daysBetweenIso(min, range.start) * dayW;
  const natural = (daysBetweenIso(range.start, range.end) + 1) * dayW;
  return { left, width: Math.max(MIN_BAR, natural), handles: natural >= HANDLES_FROM };
}
const daysBetweenIso = (a, b) => toDay(b) - toDay(a);
