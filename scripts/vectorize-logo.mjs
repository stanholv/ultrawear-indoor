// Traces the cleaned wordmark bitmap into a smooth, resolution-independent SVG.
// This removes the pixelation from the low-res screenshot source.
//
//   node scripts/vectorize-logo.mjs
//
// Input : scripts/logo-clean.png  (flat ink on transparent — from clean-logo.mjs)
// Output: scripts/logo-clean.svg  (vector; preferred source for generate-icons)

import sharp from 'sharp';
import potrace from 'potrace';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'logo-clean.png');
const OUT = join(__dirname, 'logo-clean.svg');

const INK = '#3a3a3a';

function trace(buf, opts) {
  return new Promise((resolve, reject) => {
    potrace.trace(buf, opts, (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

async function main() {
  // potrace wants a dark-on-light bitmap. Flatten onto white, upscale, then
  // blur heavily so the tracer follows smooth contours instead of pixel steps.
  const bmp = await sharp(SRC)
    .resize({ width: 1400, fit: 'inside', kernel: 'lanczos3' })
    .flatten({ background: '#ffffff' })
    .blur(6)
    .toBuffer();

  const svg = await trace(bmp, {
    color: INK,
    background: 'transparent',
    threshold: 150,
    turdSize: 80,       // drop small speckles
    optTolerance: 1.2,  // aggressive curve optimisation = smoother
    alphaMax: 1.3,      // rounder corners
    turnPolicy: potrace.Potrace.TURNPOLICY_MINORITY,
  });

  await writeFile(OUT, svg);
  console.log(`✓ ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
