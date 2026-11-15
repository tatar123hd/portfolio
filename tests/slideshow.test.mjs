import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { wrapIndex } from '../assets/js/lib/slides.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const teams = html.slice(html.indexOf('id="teams"'), html.indexOf('id="music"'));

test('wrapIndex wraps both ways', () => {
  assert.equal(wrapIndex(0, 4, -1), 3);
  assert.equal(wrapIndex(3, 4, 1), 0);
  assert.equal(wrapIndex(1, 4, 1), 2);
  assert.equal(wrapIndex(2, 4, 0), 2);
});

test('teams section has a four-photo slideshow, each slide with alt text', () => {
  const slides = teams.match(/<figure class="slides__item[^"]*"[\s\S]*?<\/figure>/g) || [];
  assert.equal(slides.length, 4);
  for (const s of slides) assert.match(s, /<img\b[^>]*\balt="[^"]{10,}"/);
  for (const slug of ['teams-stablecoin', 'teams-smu', 'teams-bbl', 'teams-workshops']) assert.ok(teams.includes(`${slug}-800.webp`), slug);
});

test('each bullet points at its slide, in the same order', () => {
  const ids = [...teams.matchAll(/<li data-slide="(\d)"/g)].map((m) => m[1]);
  assert.deepEqual(ids, ['0', '1', '2', '3']);
});

test('slideshow has a pause control and no captions', () => {
  assert.match(teams, /class="slides__pause"/);
  assert.ok(!/<figcaption/.test(teams));
});
