// Local static server for checking the site before deploying.
// Usage: node tools/serve.mjs [port]   (default 5173)
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const port = Number(process.argv[2]) || 5173;

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
  '.woff2': 'font/woff2',
};

async function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  const base = join(root, clean);
  if (!base.startsWith(root)) return null;
  // Mirrors Vercel cleanUrls: /planner -> planner.html, / -> index.html
  for (const candidate of [base, base + '.html', join(base, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolveFile(new URL(req.url, 'http://x').pathname);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Not found');
  }
  res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  res.end(await readFile(file));
}).listen(port, () => console.log(`Serving ${root} at http://localhost:${port}`));
