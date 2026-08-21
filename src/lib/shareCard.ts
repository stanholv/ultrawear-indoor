// Genereert een deelbare resultaat-afbeelding (1080x1080) voor in WhatsApp e.d.
// Volledig client-side via canvas; deelt met de Web Share API, valt terug op download.

export interface MatchCardData {
  isThuis: boolean;
  opponent: string;
  ultra: number;
  tegen: number;
  res: 'W' | 'D' | 'L';
  datum: string;          // al geformatteerd, bv. "28 mei 2026"
  scorers: string[];      // bv. ["Pieter 5", "Slekke 2"]
}

const RED = '#C8102E';
const COND = "'Barlow Condensed', Arial, sans-serif";
const BODY = "'Barlow', Arial, sans-serif";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src; // zelfde origin (public/) → geen CORS-taint op de canvas
  });
}

// Zorg dat de merk-fonts geladen zijn vóór we op canvas tekenen.
async function ensureFonts() {
  try {
    const f = (document as any).fonts;
    if (!f) return;
    await Promise.all([
      f.load("700 230px 'Barlow Condensed'"),
      f.load("600 46px 'Barlow Condensed'"),
      f.load("500 40px 'Barlow'"),
    ]);
  } catch { /* val terug op Arial */ }
}

export async function generateMatchCard(d: MatchCardData): Promise<Blob> {
  const S = 1080;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;

  await ensureFonts();

  // Achtergrond
  x.fillStyle = '#0d0d0d';
  x.fillRect(0, 0, S, S);

  // Dunne rode accentstreep bovenaan (jersey)
  x.fillStyle = RED;
  x.fillRect(0, 0, S, 14);

  x.textAlign = 'center';

  // Crest bovenaan
  try {
    const crest = await loadImage('/logo.png');
    const size = 300;
    x.drawImage(crest, (S - size) / 2, 44, size, size);
  } catch {
    x.fillStyle = '#fff';
    x.font = `700 72px ${COND}`;
    x.fillText('ULTRAWEAR INDOOR', S / 2, 240);
  }

  // Matchup
  x.fillStyle = '#bcb7ad';
  x.font = `600 46px ${COND}`;
  const matchup = (d.isThuis ? 'THUIS vs ' : 'UIT @ ') + d.opponent;
  x.fillText(truncate(x, matchup.toUpperCase(), S - 120), S / 2, 440);

  // Score
  x.fillStyle = '#ffffff';
  x.font = `700 230px ${COND}`;
  x.fillText(`${d.ultra} – ${d.tegen}`, S / 2, 700);

  // Resultaat
  const col = d.res === 'W' ? '#10b981' : d.res === 'D' ? '#f59e0b' : '#ef4444';
  const label = d.res === 'W' ? 'GEWONNEN' : d.res === 'D' ? 'GELIJKSPEL' : 'VERLOREN';
  x.fillStyle = col;
  x.font = `700 80px ${COND}`;
  x.fillText(label, S / 2, 812);

  // Datum
  x.fillStyle = '#8f8b82';
  x.font = `500 40px ${BODY}`;
  x.fillText(d.datum, S / 2, 872);

  // Scorers (max 2 regels)
  if (d.scorers.length) {
    x.fillStyle = '#d8d3c8';
    x.font = `500 36px ${BODY}`;
    const lines = wrap(x, 'Doelpunten: ' + d.scorers.join('  ·  '), S - 140);
    lines.slice(0, 2).forEach((ln, i) => x.fillText(ln, S / 2, 948 + i * 50));
  }

  // Footer
  x.fillStyle = '#6f6b63';
  x.font = `500 32px ${BODY}`;
  x.fillText('ultrawear-indoor.vercel.app', S / 2, 1040);

  return new Promise(resolve => c.toBlob(b => resolve(b!), 'image/png'));
}

function truncate(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Deelt de afbeelding; valt terug op download als delen niet kan.
export async function shareImage(blob: Blob, filename: string, text: string): Promise<'shared' | 'downloaded' | 'cancelled'> {
  const file = new File([blob], filename, { type: 'image/png' });
  const nav = navigator as any;
  if (nav.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({ files: [file], text });
      return 'shared';
    } catch (e: any) {
      if (e?.name === 'AbortError') return 'cancelled';
      // anders: terugvallen op download
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return 'downloaded';
}
