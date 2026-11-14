import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadState, saveState } from '../assets/js/lib/store.js';

const memory = () => {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) };
};

test('round trip through storage', () => {
  const s = memory();
  assert.equal(saveState('k', { a: 1 }, s), true);
  assert.deepEqual(loadState('k', null, s), { a: 1 });
});

test('missing key gives fallback', () => assert.deepEqual(loadState('nope', { f: 1 }, memory()), { f: 1 }));

test('corrupt JSON gives fallback', () => {
  const s = { getItem: () => '{bad', setItem() {} };
  assert.deepEqual(loadState('k', { f: 1 }, s), { f: 1 });
});

test('throwing storage gives fallback and save reports false', () => {
  const s = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('blocked'); } };
  assert.deepEqual(loadState('k', { f: 1 }, s), { f: 1 });
  assert.equal(saveState('k', { a: 1 }, s), false);
});

test('missing storage object gives fallback', () => {
  assert.equal(loadState('k', 7, null), 7);
  assert.equal(saveState('k', 7, null), false);
});
