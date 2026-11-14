import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toDay, fromDay, addDays, daysBetween, startOfWeek, fmtShort } from '../assets/js/lib/dates.js';

test('addDays crosses a year boundary', () => assert.equal(addDays('2026-12-31', 1), '2027-01-01'));
test('addDays goes backwards', () => assert.equal(addDays('2026-03-01', -1), '2026-02-28'));
test('daysBetween counts b minus a', () => assert.equal(daysBetween('2026-03-01', '2026-03-11'), 10));
test('startOfWeek returns the Monday', () => {
  assert.equal(startOfWeek('2026-11-14'), '2026-11-09'); // Saturday
  assert.equal(startOfWeek('2026-11-09'), '2026-11-09'); // Monday
  assert.equal(startOfWeek('2026-11-15'), '2026-11-09'); // Sunday
});
test('fmtShort is day then month', () => assert.equal(fmtShort('2026-09-13'), '13 Sep'));
test('toDay and fromDay round trip', () => {
  for (const d of ['1970-01-01', '2026-02-28', '2028-02-29', '2027-04-30']) assert.equal(fromDay(toDay(d)), d);
  assert.equal(toDay('1970-01-02'), 1);
});
