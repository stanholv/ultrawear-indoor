// Generates PWA icons + favicon + header logo from a local vector source.
// Run with: node scripts/generate-icons.mjs
//
// To use real brand artwork instead: replace ICON_SVG / LOGO_SVG below with
// your own (or point sharp at a high-res PNG) and re-run.

import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');

const RED = '#C8102E';

// App icon: full-bleed red background + white football (maskable-safe).
const ICON_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${RED}"/>
  <g transform="translate(256,256)">
    <circle r="150" fill="#fff"/>
    <!-- centre pentagon -->
    <polygon points="0,-60 57.06,-18.54 35.27,48.54 -35.27,48.54 -57.06,-18.54" fill="#111"/>
    <!-- seams from pentagon vertices to ball edge -->
    <g stroke="#111" stroke-width="9" stroke-linecap="round">
      <line x1="0" y1="-60" x2="0" y2="-150"/>
      <line x1="57.06" y1="-18.54" x2="142.66" y2="-46.35"/>
      <line x1="35.27" y1="48.54" x2="88.17" y2="121.35"/>
      <line x1="-35.27" y1="48.54" x2="-88.17" y2="121.35"/>
      <line x1="-57.06" y1="-18.54" x2="-142.66" y2="-46.35"/>
    </g>
    <!-- partial edge pentagons (hints) -->
    <g fill="#111">
      <circle cx="0" cy="-150" r="13"/>
      <circle cx="142.66" cy="-46.35" r="13"/>
      <circle cx="88.17" cy="121.35" r="13"/>
      <circle cx="-88.17" cy="121.35" r="13"/>
      <circle cx="-142.66" cy="-46.35" r="13"/>
    </g>
  </g>
</svg>`;

// Header mark: square red football on transparent bg (sits in the white logo
// box next to the "ULTRAWEAR INDOOR" wordmark, which the header renders as text).
const LOGO_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <g transform="translate(256,256)">
    <circle r="240" fill="${RED}"/>
    <polygon points="0,-96 91.3,-29.66 56.43,77.66 -56.43,77.66 -91.3,-29.66" fill="#fff"/>
    <g stroke="#fff" stroke-width="15" stroke-linecap="round">
      <line x1="0" y1="-96" x2="0" y2="-240"/>
      <line x1="91.3" y1="-29.66" x2="228.25" y2="-74.16"/>
      <line x1="56.43" y1="77.66" x2="141.08" y2="194.16"/>
      <line x1="-56.43" y1="77.66" x2="-141.08" y2="194.16"/>
      <line x1="-91.3" y1="-29.66" x2="-228.25" y2="-74.16"/>
    </g>
    <g fill="#fff">
      <circle cx="0" cy="-240" r="21"/>
      <circle cx="228.25" cy="-74.16" r="21"/>
      <circle cx="141.08" cy="194.16" r="21"/>
      <circle cx="-141.08" cy="194.16" r="21"/>
      <circle cx="-228.25" cy="-74.16" r="21"/>
    </g>
  </g>
</svg>`;

const icon = Buffer.from(ICON_SVG);

async function pngFromSvg(svgBuf, size, file) {
  await sharp(svgBuf, { density: 384 }).resize(size, size).png().toFile(join(publicDir, file));
  console.log(`  ✓ ${file}`);
}

async function main() {
  await pngFromSvg(icon, 192, 'pwa-192x192.png');
  await pngFromSvg(icon, 512, 'pwa-512x512.png');
  await pngFromSvg(icon, 512, 'maskable-512x512.png');
  await pngFromSvg(icon, 180, 'apple-touch-icon.png');
  await pngFromSvg(icon, 32, 'favicon-32x32.png');

  // favicon.ico (32px)
  const ico = await sharp(icon, { density: 384 }).resize(32, 32).png().toBuffer();
  await sharp(ico).toFile(join(publicDir, 'favicon.ico'));
  console.log('  ✓ favicon.ico');

  // SVG favicon (crisp at any size)
  await writeFile(join(publicDir, 'favicon.svg'), ICON_SVG.trim());
  console.log('  ✓ favicon.svg');

  // Header mark (transparent square PNG for the logo box)
  await sharp(Buffer.from(LOGO_SVG), { density: 384 })
    .resize(132, 132)
    .png()
    .toFile(join(publicDir, 'logo.png'));
  console.log('  ✓ logo.png');

  console.log('Done.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
