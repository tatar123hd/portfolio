import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RESEARCH_LOG } from '../assets/js/data/research-log.js';

test('five weeks, oldest first', () => {
  assert.deepEqual(RESEARCH_LOG.map((w) => w.label), ['16 Aug', '23 Aug', '30 Aug', '6 Sep', '13 Sep']);
  assert.equal(RESEARCH_LOG[0].week, '2026-08-16');
  assert.equal(RESEARCH_LOG[4].week, '2026-09-13');
});

test('every week has five calls', () => {
  for (const w of RESEARCH_LOG) assert.equal(w.calls.length, 5, w.label);
});

test('latest week matches the CSV', () => {
  const w = RESEARCH_LOG[4];
  assert.deepEqual(w.calls.map((c) => c.ticker), ['CB', 'VGK', 'SCB', 'PTTEP', 'BTC']);
  assert.deepEqual(w.calls.map((c) => c.call), ['BUY', 'HOLD', 'BUY', 'BUY', 'PASS']);
});

test('quoted fields with commas and baht signs survive', () => {
  const scb = RESEARCH_LOG[4].calls.find((c) => c.ticker === 'SCB');
  assert.equal(scb.kill, 'FY26 final DPS <฿9.28, or close <฿140.00');
  assert.equal(scb.risk, 'Thai household-debt NPLs');
});

test('why is one short line', () => {
  for (const w of RESEARCH_LOG) for (const c of w.calls) {
    assert.ok(c.why.length > 0 && c.why.length <= 161, `${w.label} ${c.ticker}: ${c.why.length}`);
    assert.ok(!c.why.includes(';'));
  }
});

test('no em dashes reach the page', () => {
  assert.ok(!JSON.stringify(RESEARCH_LOG).includes('—'));
});

test('no private fields leak', () => {
  for (const w of RESEARCH_LOG) for (const c of w.calls) {
    assert.deepEqual(Object.keys(c).sort(), ['asset', 'call', 'conf', 'horizon', 'kill', 'risk', 'ticker', 'type', 'why']);
  }
});
