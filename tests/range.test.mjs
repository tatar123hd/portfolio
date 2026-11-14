import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moveRange, resizeRange } from '../assets/js/lib/range.js';

const b = { min: '2026-01-01', max: '2026-06-30' };
const r = { start: '2026-01-05', end: '2026-01-09' };

test('move keeps length', () => assert.deepEqual(moveRange(r, 7, b), { start: '2026-01-12', end: '2026-01-16' }));
test('move past min clamps and keeps length', () => assert.deepEqual(moveRange(r, -10, b), { start: '2026-01-01', end: '2026-01-05' }));
test('move past max pins end to max', () => assert.deepEqual(moveRange(r, 400, b), { start: '2026-06-26', end: '2026-06-30' }));
test('resize end past start leaves one day', () => assert.deepEqual(resizeRange(r, 'end', -30, b), { start: '2026-01-05', end: '2026-01-05' }));
test('resize start past end leaves one day', () => assert.deepEqual(resizeRange(r, 'start', 30, b), { start: '2026-01-09', end: '2026-01-09' }));
test('resize end clamps to max', () => assert.deepEqual(resizeRange(r, 'end', 999, b), { start: '2026-01-05', end: '2026-06-30' }));
test('resize start clamps to min', () => assert.deepEqual(resizeRange(r, 'start', -999, b), { start: '2026-01-01', end: '2026-01-09' }));
