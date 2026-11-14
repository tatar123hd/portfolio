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
