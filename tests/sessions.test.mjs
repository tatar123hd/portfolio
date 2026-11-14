import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateSessions } from '../assets/js/lib/sessions.js';

test('generates evenly spaced sessions', () => {
  assert.deepEqual(generateSessions({ start: '2026-01-05', everyWeeks: 2, count: 3, lengthDays: 2 }), [
    { start: '2026-01-05', end: '2026-01-06' },
    { start: '2026-01-19', end: '2026-01-20' },
    { start: '2026-02-02', end: '2026-02-03' },
  ]);
});

test('count below 1 gives nothing', () => {
  assert.deepEqual(generateSessions({ start: '2026-01-05', everyWeeks: 1, count: 0, lengthDays: 1 }), []);
  assert.deepEqual(generateSessions({ start: '2026-01-05', everyWeeks: 1, count: -1, lengthDays: 1 }), []);
});

test('count is capped at 52', () => {
  assert.equal(generateSessions({ start: '2026-01-05', everyWeeks: 1, count: 500, lengthDays: 1 }).length, 52);
});

test('everyWeeks below 1 is treated as 1', () => {
  const s = generateSessions({ start: '2026-01-05', everyWeeks: 0, count: 2, lengthDays: 1 });
  assert.deepEqual(s.map((x) => x.start), ['2026-01-05', '2026-01-12']);
});

test('lengthDays below 1 is treated as 1', () => {
  assert.deepEqual(generateSessions({ start: '2026-01-05', everyWeeks: 1, count: 1, lengthDays: 0 }), [{ start: '2026-01-05', end: '2026-01-05' }]);
});

test('non-numeric input gives nothing instead of throwing', () => {
  assert.deepEqual(generateSessions({ start: '2026-01-05', everyWeeks: 'x', count: 'y', lengthDays: null }), []);
});

test('missing or invalid start date gives nothing', () => {
  assert.deepEqual(generateSessions({ start: '', everyWeeks: 1, count: 3, lengthDays: 1 }), []);
});
