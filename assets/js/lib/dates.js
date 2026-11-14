// Date helpers. Dates are ISO 'YYYY-MM-DD' strings; all maths is in UTC so the
// viewer's time zone can never shift a day.
const DAY_MS = 86400000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function toDay(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS);
}

export function fromDay(n) {
  return new Date(n * DAY_MS).toISOString().slice(0, 10);
}

export const addDays = (iso, n) => fromDay(toDay(iso) + n);

export const daysBetween = (a, b) => toDay(b) - toDay(a);

export function startOfWeek(iso) {
  const n = toDay(iso);
  const weekday = (new Date(n * DAY_MS).getUTCDay() + 6) % 7; // Monday = 0
  return fromDay(n - weekday);
}

export function fmtShort(iso) {
  const [, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]}`;
}

export const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && fromDay(toDay(s)) === s;
