import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ranatFreq, RANAT_BARS } from '../assets/js/lib/ranat.js';

test('the instrument has 21 bars', () => assert.equal(RANAT_BARS, 21));
test('bar 0 is the base pitch', () => assert.equal(ranatFreq(0), 392));
test('seven steps make an octave', () => assert.ok(Math.abs(ranatFreq(7) - 784) < 0.001));
test('custom base pitch', () => assert.ok(Math.abs(ranatFreq(14, 100) - 400) < 0.001));
