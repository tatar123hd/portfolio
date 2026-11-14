import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findClashes, clashSentence } from '../assets/js/lib/clash.js';

const A = { id: 'a', name: 'Data literacy', people: ['Ton'], start: '2026-03-01', end: '2026-03-10' };

test('back-to-back bookings are not a clash', () => {
  const B = { id: 'b', name: 'Leadership Q1', people: ['Ton'], start: '2026-03-11', end: '2026-03-20' };
  assert.deepEqual(findClashes([A, B]), []);
});

test('sharing one day is a clash covering that day, earlier item first', () => {
  const B = { id: 'b', name: 'Leadership Q1', people: ['Ton'], start: '2026-03-10', end: '2026-03-12' };
  assert.deepEqual(findClashes([B, A]), [{ person: 'Ton', a: 'a', b: 'b', from: '2026-03-10', to: '2026-03-10' }]);
});

test('multi-person item clashes only for the shared person', () => {
  const P = { id: 'p', name: 'Pilot', people: ['Ploy', 'Nok'], start: '2026-03-01', end: '2026-03-05' };
  const N = { id: 'n', name: 'Review', people: ['Nok'], start: '2026-03-04', end: '2026-03-08' };
  const Q = { id: 'q', name: 'Other', people: ['Ploy'], start: '2026-04-01', end: '2026-04-02' };
  assert.deepEqual(findClashes([P, N, Q]), [{ person: 'Nok', a: 'p', b: 'n', from: '2026-03-04', to: '2026-03-05' }]);
});

test('three overlapping items give three pairs', () => {
  const mk = (id) => ({ id, name: id, people: ['Mint'], start: '2026-05-01', end: '2026-05-09' });
  assert.equal(findClashes([mk('x'), mk('y'), mk('z')]).length, 3);
});

test('different people never clash', () => {
  const B = { ...A, id: 'b', people: ['Fah'] };
  assert.deepEqual(findClashes([A, B]), []);
});

test('clashSentence reads plainly for a span', () => {
  const c = { person: 'Ton', a: 'a', b: 'b', from: '2026-03-03', to: '2026-03-10' };
  const names = { a: 'Data literacy', b: 'Leadership Q1' };
  assert.equal(clashSentence(c, (id) => names[id]),
    'Ton is double-booked from 3 Mar to 10 Mar (Data literacy and Leadership Q1).');
});

test('clashSentence for a single day says on', () => {
  const c = { person: 'Ton', a: 'a', b: 'b', from: '2026-03-10', to: '2026-03-10' };
  assert.equal(clashSentence(c, (id) => id), 'Ton is double-booked on 10 Mar (a and b).');
});
