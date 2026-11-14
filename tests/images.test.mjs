import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync, readFileSync, statSync } from 'node:fs';

const require = createRequire(new URL('../tools/package.json', import.meta.url));
const sharp = require('sharp');
const root = new URL('../', import.meta.url);
const at = (p) => new URL(p, root);

const SLUGS = ['profile', 'set-camp', 'aia', 'anyai', 'cubs', 'petra'];

for (const slug of SLUGS) {
  test(`${slug}: both sizes exist, are not upscaled past the target, and carry no EXIF`, async () => {
    for (const w of [800, 1600]) {
      const file = at(`assets/img/${slug}-${w}.webp`);
      assert.ok(existsSync(file), `${slug}-${w}.webp missing`);
      const meta = await sharp(readFileSync(file)).metadata();
      assert.equal(meta.format, 'webp');
      assert.ok(meta.width <= w, `${slug}-${w} is ${meta.width}px wide`);
      assert.equal(meta.exif, undefined, `${slug}-${w} has EXIF`);
    }
    assert.ok(statSync(at(`assets/img/${slug}-800.webp`)).size < 150 * 1024, `${slug}-800 too heavy`);
  });
}

test('social image is 1200x630 JPEG', async () => {
  const meta = await sharp(readFileSync(at('og.jpg'))).metadata();
  assert.equal(meta.format, 'jpeg');
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
});

test('favicon is an SVG', () => {
  assert.match(readFileSync(at('favicon.svg'), 'utf8'), /^<svg[\s\S]*<\/svg>\s*$/);
});

test('CV is the resume, byte for byte', () => {
  const cv = readFileSync(at('assets/Yossapat-Charoensakkajorn-CV.pdf'));
  const resume = readFileSync(at('Yossapat Charoensakkajorn - Resume.pdf'));
  assert.ok(cv.equals(resume));
});
