// Generates PWA icons + favicon + header logo from the real Ultrawear logo.
//
// 1. Save the logo into the repo as  scripts/logo-source.png
//    (PNG with a transparent background works best; SVG/JPG/WEBP also fine).
// 2. Run:  node scripts/generate-icons.mjs
// 3. Rebuild:  npm run build
//
// No artwork is invented here — every output is derived from your source file.

import sharp from 'sharp';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

// First matching source file wins. Pass an explicit path as the first arg too.
const candidates = [
  process.argv[2],
  'logo-clean.png', // cleaned wordmark (preferred) — see clean-logo.mjs
  'logo-source.png', 'logo-source.svg', 'logo-source.jpg',
  'logo-source.jpeg', 'logo-source.webp',
].filter(Boolean).map(f => (f.includes('/') || f.includes('\\') ? f : join(__dirname, f)));

const source = candidates.find(p => existsSync(p));
if (!source) {
  console.error('No logo source found. Save your logo as scripts/logo-source.png and re-run.');
  process.exit(1);
}
console.log(`Source: ${source}`);

const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// Square icon: trim the logo, then center it on a white canvas with a margin.
async function squareIcon(size, contentRatio, file) {
  const inner = Math.round(size * contentRatio);
  const logo = await sharp(source)
    .trim()
    .resize(inner, inner, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: WHITE } })
    .composite([{ input: logo, gravity: 'centre' }])
    .png()
    .toFile(join(publicDir, file));
  console.log(`  ✓ ${file}`);
}

async function main() {
  await squareIcon(192, 0.84, 'pwa-192x192.png');
  await squareIcon(512, 0.84, 'pwa-512x512.png');
  // Maskable needs extra margin so nothing is clipped by the OS mask.
  await squareIcon(512, 0.66, 'maskable-512x512.png');
  await squareIcon(180, 0.84, 'apple-touch-icon.png');
  await squareIcon(32, 0.92, 'favicon-32x32.png');

  const ico = await sharp(source)
    .trim()
    .resize(28, 28, { fit: 'inside' })
    .extend({ top: 2, bottom: 2, left: 2, right: 2, background: WHITE })
    .png()
    .toBuffer();
  await sharp(ico).resize(32, 32, { fit: 'contain', background: WHITE }).toFile(join(publicDir, 'favicon.ico'));
  console.log('  ✓ favicon.ico');

  // Header logo: trimmed, transparent, fits the logo box.
  await sharp(source)
    .trim()
    .resize(264, 264, { fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(publicDir, 'logo.png'));
  console.log('  ✓ logo.png');

  console.log('Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
