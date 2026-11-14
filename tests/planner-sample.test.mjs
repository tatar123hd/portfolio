import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SAMPLE } from '../assets/js/data/planner-sample.js';
import { bookableItems } from '../assets/js/lib/planner-model.js';
import { findClashes } from '../assets/js/lib/clash.js';

const items = SAMPLE.items;
const byId = new Map(items.map((i) => [i.id, i]));

test('six invented people', () => assert.deepEqual(SAMPLE.people, ['Ploy', 'Ton', 'Nok', 'Mint', 'Bank', 'Fah']));

test('areas and labels match the spec', () => {
  assert.deepEqual(SAMPLE.areas, ['Leadership', 'Credit', 'Digital', 'Product', 'Sustainability', 'Sales', 'Special event']);
  assert.deepEqual(SAMPLE.labels.map((l) => l.name), ['Urgent', 'Important', 'Waiting approval', 'Waiting info', 'Follow up', 'Ready']);
});

test('at least three projects, each with two phases and a task', () => {
  const projects = items.filter((i) => i.kind === 'project');
  assert.ok(projects.length >= 3);
  for (const p of projects) {
    const phases = items.filter((i) => i.kind === 'phase' && i.parent === p.id);
    assert.ok(phases.length >= 2, p.name);
    assert.ok(items.some((i) => i.kind === 'task' && phases.some((ph) => ph.id === i.parent)), p.name);
  }
});

test('at least four courses, each with a plan and a run stage', () => {
  const groups = new Set(items.filter((i) => i.kind === 'course').map((i) => i.group));
  assert.ok(groups.size >= 4);
  for (const g of groups) {
    const stages = items.filter((i) => i.group === g).map((i) => i.stage).sort();
    assert.deepEqual(stages, ['plan', 'run'], g);
  }
});

test('references, dates and fields are valid', () => {
  const labelIds = new Set(SAMPLE.labels.map((l) => l.id));
  for (const i of items) {
    if (i.parent) assert.ok(byId.has(i.parent), i.id);
    assert.ok(i.end >= i.start, i.id);
    assert.ok(i.start >= '2026-11-01' && i.end <= '2027-04-30', i.id);
    assert.ok(SAMPLE.areas.includes(i.area), i.id);
    assert.ok(i.people.every((p) => SAMPLE.people.includes(p)), i.id);
    if (i.label) assert.ok(labelIds.has(i.label), i.id);
    assert.ok(['not-started', 'in-progress', 'blocked', 'done'].includes(i.status), i.id);
  }
});

test('exactly one deliberate clash among bookable items', () => {
  const clashes = findClashes(bookableItems(items));
  assert.equal(clashes.length, 1);
  assert.equal(clashes[0].person, 'Ton');
});

test('no real organisation names', () => {
  const text = JSON.stringify(SAMPLE);
  assert.ok(!/Bangkok Bank|BBL|ธนาคาร/i.test(text));
});

test('bookableItems skips projects and phases that have tasks', () => {
  const sample = [
    { id: 'p', kind: 'project' },
    { id: 'ph1', kind: 'phase', parent: 'p' },
    { id: 'ph2', kind: 'phase', parent: 'p' },
    { id: 't', kind: 'task', parent: 'ph1' },
    { id: 'c', kind: 'course' },
  ];
  assert.deepEqual(bookableItems(sample).map((i) => i.id), ['ph2', 't', 'c']);
});
