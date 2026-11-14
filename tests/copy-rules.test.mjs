import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const pages = ['index.html', 'planner.html'].filter((p) => existsSync(new URL(p, root)));
const html = (p) => readFileSync(new URL(p, root), 'utf8');
const visibleText = (s) =>
  s.replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ');

const BANNED = [
  'passionate', 'journey', 'leverage', 'seamless', 'delve', 'crafted', 'holds up', 'hold up',
  'at the intersection', "let's build", 'elevate', 'unlock', 'empower', 'harness', 'robust',
  'powerful', 'cutting-edge', 'game-changer', 'honest', 'genuinely', 'truly', 'thoughtful',
];

test('index.html exists', () => assert.ok(pages.includes('index.html')));

for (const p of pages) {
  test(`${p}: no banned words`, () => {
    const t = visibleText(html(p)).toLowerCase();
    for (const w of BANNED) assert.ok(!t.includes(w), `"${w}" found in ${p}`);
  });
  test(`${p}: no em dashes or exclamation marks in page text`, () => {
    const t = visibleText(html(p));
    assert.ok(!t.includes('—'), `em dash in ${p}`);
    assert.ok(!/!/.test(t), `exclamation mark in ${p}`);
  });
  test(`${p}: phone number never printed`, () => {
    const s = html(p);
    assert.ok(!s.includes('909 757') && !s.includes('909757') && !s.includes('+66'), `phone in ${p}`);
  });
  test(`${p}: no closed company link`, () => assert.ok(!html(p).includes('anyaith.com')));
}

test('index.html links to every agreed source', () => {
  const s = html('index.html');
  for (const link of [
    'docs.tokenomist.ai/overview',
    'tokenomist.ai/reports/tokenomist-annual-report-2025',
    'youtube.com/@petrabandofficial6304',
    'linkedin.com/in/yossapat-charoensakkajorn-a5000b29a',
    'coursera.org/verify/professional-cert/0L8WKS2UNC3L',
    'coursera.org/verify/professional-cert/7R07JRQ7HA7B',
    'urn:li:activity:7518122069809737728',
    'urn:li:activity:7513775678878654464',
    'urn:li:activity:7475438314238615552',
    'urn:li:activity:7482714005711527936',
    'assets/Yossapat-Charoensakkajorn-CV.pdf',
    'planner',
  ]) assert.ok(s.includes(link), `missing link: ${link}`);
});

test('every image has alt text and every section has a heading', () => {
  const s = html('index.html');
  for (const img of s.match(/<img\b[^>]*>/g) || []) assert.match(img, /\balt="[^"]+"/, img);
  for (const id of ['work', 'competitions', 'teams', 'music', 'writing', 'path', 'contact']) {
    assert.match(s, new RegExp(`<(?:section|footer)[^>]*id="${id}"[\\s\\S]*?<h2`), `section #${id} or its h2 missing`);
  }
});
