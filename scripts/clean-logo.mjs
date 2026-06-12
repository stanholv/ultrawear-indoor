// Lifts the Ultrawear wordmark off its textured background into a clean,
// transparent, solid-colour PNG. Tunable constants up top.
//
//   node scripts/clean-logo.mjs
//
// Input : scripts/logo-source.png  (gray script on textured gray bg)
// Output: scripts/logo-clean.png   (flat-coloured wordmark, transparent)

import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'logo-source.png');
const OUT = join(__dirname, 'logo-clean.png');

const THRESHOLD = 138;   // luminance below this = ink
const SOFTNESS = 14;     // edge anti-alias ramp width
const BORDER_CROP = 10;  // px stripped from each edge to drop the dashed frame
const INK = { r: 0x3a, g: 0x3a, b: 0x3a }; // flat ink colour (dark charcoal)

async function main() {
  const { data, info } = await sharp(SRC)
    .greyscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height } = info;
  const rgba = Buffer.alloc(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const lum = data[y * width + x];
      // Soft threshold: fully opaque well below THRESHOLD, fading to 0 above.
      let a = Math.round(((THRESHOLD - lum) / SOFTNESS) * 255 + 127);
      a = Math.max(0, Math.min(255, a));
      // Drop the dashed border frame near the edges.
      if (x < BORDER_CROP || y < BORDER_CROP || x >= width - BORDER_CROP || y >= height - BORDER_CROP) {
        a = 0;
      }
      const o = (y * width + x) * 4;
      rgba[o] = INK.r; rgba[o + 1] = INK.g; rgba[o + 2] = INK.b; rgba[o + 3] = a;
    }
  }

  await sharp(rgba, { raw: { width, height, channels: 4 } })
    .median(3)                 // remove texture speckle + stray dash bits
    .blur(0.4)                 // gentle edge smoothing
    .trim({ threshold: 10 })   // crop to the wordmark
    .png()
    .toFile(OUT);

  console.log(`✓ ${OUT}`);
}

main().catch(e => { console.error(e); process.exit(1); });
