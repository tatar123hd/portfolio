// Double-booking detection. Ranges are inclusive: an item ending the day before
// another starts is not a clash.
import { fmtShort } from './dates.js';

export function findClashes(items) {
  const byPerson = new Map();
  for (const item of items) {
    for (const person of item.people || []) {
      if (!byPerson.has(person)) byPerson.set(person, []);
      byPerson.get(person).push(item);
    }
  }
  const clashes = [];
  for (const [person, list] of byPerson) {
    const sorted = [...list].sort((x, y) => (x.start < y.start ? -1 : x.start > y.start ? 1 : 0));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        if (b.start > a.end) continue;
        clashes.push({ person, a: a.id, b: b.id, from: b.start, to: a.end < b.end ? a.end : b.end });
      }
    }
  }
  return clashes;
}

export function clashSentence(c, nameOf) {
  const when = c.from === c.to ? `on ${fmtShort(c.from)}` : `from ${fmtShort(c.from)} to ${fmtShort(c.to)}`;
  return `${c.person} is double-booked ${when} (${nameOf(c.a)} and ${nameOf(c.b)}).`;
}
