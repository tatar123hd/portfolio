// One-off image pipeline: source photos in the repo root -> assets/img/*.webp.
// Strips all metadata (EXIF, GPS). Also writes og.jpg and copies the CV.
// Usage: node tools/optimize-images.mjs
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const root = new URL('../', import.meta.url);
const at = (p) => new URL(p, root);

const SOURCES = {
  profile: 'Profile photo.png',
  'set-camp': 'SET camp win.png',
  aia: 'AIA runner-up award.png',
  anyai: 'ANY AI pitches.jpg',
  'teams-stablecoin': 'Work with other - study of stablecoins.png',
  'teams-smu': 'Work with other - Singapore Management University.png',
  'teams-bbl': 'Work with other - Bangkok Bank.jpg',
  'teams-workshops': 'Work with other - three workshops.jpg',
  petra: 'Petra Band concerts.png',
};
const WIDTHS = [800, 1600];

mkdirSync(at('assets/img/'), { recursive: true });

for (const [slug, file] of Object.entries(SOURCES)) {
  const input = readFileSync(at(file));
  for (const width of WIDTHS) {
    // .rotate() applies EXIF orientation before metadata is dropped (sharp drops it by default).
    await sharp(input)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(at(`assets/img/${slug}-${width}.webp`).pathname.slice(1));
  }
  console.log(`img: ${slug}`);
}

// Social preview: paper background, name in serif, profile photo on the right.
const W = 1200;
const H = 630;
const photo = await sharp(readFileSync(at(SOURCES.profile))).resize(430, 630, { fit: 'cover', position: 'top' }).toBuffer();
const text = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f6f3ec"/>
  <text x="72" y="118" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#6b655a">Bangkok · Learning &amp; Development</text>
  <text x="72" y="290" font-family="Georgia, 'Times New Roman', serif" font-size="74" fill="#1d1b17">Yossapat</text>
  <text x="72" y="380" font-family="Georgia, 'Times New Roman', serif" font-size="74" fill="#1d1b17">Charoensakkajorn</text>
  <rect x="72" y="430" width="96" height="3" fill="#9a3b1e"/>
  <text x="72" y="500" font-family="Segoe UI, Arial, sans-serif" font-size="26" fill="#4a463e">Finance graduate at Bangkok Bank. Plays Thai xylophone.</text>
</svg>`);
await sharp(text)
  .composite([{ input: photo, left: W - 430, top: 0 }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile(at('og.jpg').pathname.slice(1));
console.log('img: og.jpg');

copyFileSync(at('Yossapat Charoensakkajorn - Resume.pdf'), at('assets/Yossapat-Charoensakkajorn-CV.pdf'));
console.log('copied CV');
