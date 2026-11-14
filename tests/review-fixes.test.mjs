// Tests for findings from the final review.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clipSessions } from '../assets/js/lib/sessions.js';
import { barGeometry } from '../assets/js/lib/range.js';

const root = new URL('../', import.meta.url);
const read = (p) => readFileSync(new URL(p, root), 'utf8');

test('edit panel ids never collide with ids on the planner page', () => {
  const pageIds = new Set([...read('planner.html').matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const panelIds = [...read('assets/js/ui/item-panel.js').matchAll(/id: '([^']+)'/g)].map((m) => m[1]);
  assert.ok(panelIds.length >= 5, 'expected panel field ids');
  for (const id of panelIds) assert.ok(!pageIds.has(id), `panel id "${id}" also used in planner.html`);
});

test('clipSessions drops sessions that start before or end after the timeline', () => {
  const range = { min: '2026-11-01', max: '2027-04-30' };
  const sessions = [
    { start: '2026-10-01', end: '2026-10-01' },
    { start: '2026-10-31', end: '2026-11-01' },
    { start: '2026-11-01', end: '2026-11-01' },
    { start: '2027-04-30', end: '2027-04-30' },
    { start: '2027-04-30', end: '2027-05-01' },
  ];
  assert.deepEqual(clipSessions(sessions, range), [
    { start: '2026-11-01', end: '2026-11-01' },
    { start: '2027-04-30', end: '2027-04-30' },
  ]);
});

test('barGeometry keeps short bars grabbable and hides resize handles on them', () => {
  const one = barGeometry({ start: '2026-11-03', end: '2026-11-03' }, '2026-11-01', 4);
  assert.deepEqual(one, { left: 8, width: 24, handles: false });
  const ten = barGeometry({ start: '2026-11-01', end: '2026-11-10' }, '2026-11-01', 6);
  assert.deepEqual(ten, { left: 0, width: 60, handles: true });
  const short = barGeometry({ start: '2026-11-01', end: '2026-11-07' }, '2026-11-01', 6);
  assert.equal(short.handles, true, '42px bar keeps its handles');
  const tight = barGeometry({ start: '2026-11-01', end: '2026-11-05' }, '2026-11-01', 6);
  assert.equal(tight.handles, false, '30px bar is too short for two 10px handles plus a grab area');
});

// WCAG relative luminance contrast.
const lum = (hex) => {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test('task bars keep 4.5:1 text contrast, and done bars are not lightened', () => {
  const css = read('assets/css/planner.css');
  const task = css.match(/\.tl__bar--task \{[^}]*background: (#[0-9a-f]{6})/i);
  assert.ok(task, 'task bar background colour not found');
  assert.ok(contrast(task[1], '#ffffff') >= 4.5, `white on ${task[1]} is ${contrast(task[1], '#ffffff').toFixed(2)}:1`);
  const done = css.match(/\.tl__bar\.is-done \{([^}]*)\}/);
  assert.ok(done && !/brightness|opacity/.test(done[1]), 'done bars must not lower contrast');
});

test('competition lede makes no claim the sources cannot back', () => {
  assert.ok(!read('index.html').includes('asking where the numbers came from'));
});
