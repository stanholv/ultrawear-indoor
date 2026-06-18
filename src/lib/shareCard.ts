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

export function generateMatchCard(d: MatchCardData): Promise<Blob> {
  const S = 1080;
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const x = c.getContext('2d')!;

  // Achtergrond
  x.fillStyle = '#0d0d0d';
  x.fillRect(0, 0, S, S);

  // Rode kopband met diagonale strepen
  x.fillStyle = RED;
  x.fillRect(0, 0, S, 180);
  x.save();
  x.beginPath();
  x.rect(0, 0, S, 180);
  x.clip();
  x.strokeStyle = 'rgba(0,0,0,0.18)';
  x.lineWidth = 14;
  for (let i = -180; i < S; i += 40) {
    x.beginPath();
    x.moveTo(i, 180);
    x.lineTo(i + 180, 0);
    x.stroke();
  }
  x.restore();

  x.textAlign = 'center';
  x.fillStyle = '#fff';
  x.font = '800 66px Arial, sans-serif';
  x.fillText('ULTRAWEAR INDOOR', S / 2, 118);

  // Matchup
  x.fillStyle = '#bbbbbb';
  x.font = '700 42px Arial, sans-serif';
  const matchup = (d.isThuis ? 'THUIS vs ' : 'UIT @ ') + d.opponent;
  x.fillText(truncate(x, matchup.toUpperCase(), S - 120), S / 2, 380);

  // Score
  x.fillStyle = '#ffffff';
  x.font = '800 230px Arial, sans-serif';
  x.fillText(`${d.ultra} – ${d.tegen}`, S / 2, 640);

  // Resultaat-badge
  const col = d.res === 'W' ? '#10b981' : d.res === 'D' ? '#f59e0b' : '#ef4444';
  const label = d.res === 'W' ? 'GEWONNEN' : d.res === 'D' ? 'GELIJKSPEL' : 'VERLOREN';
  x.fillStyle = col;
  x.font = '800 76px Arial, sans-serif';
  x.fillText(label, S / 2, 760);

  // Datum
  x.fillStyle = '#999999';
  x.font = '500 40px Arial, sans-serif';
  x.fillText(d.datum, S / 2, 826);

  // Scorers (max 2 regels)
  if (d.scorers.length) {
    x.fillStyle = '#dddddd';
    x.font = '500 38px Arial, sans-serif';
    const lines = wrap(x, 'Doelpunten: ' + d.scorers.join('  ·  '), S - 140);
    lines.slice(0, 2).forEach((ln, i) => x.fillText(ln, S / 2, 910 + i * 52));
  }

  // Footer
  x.fillStyle = '#777777';
  x.font = '500 32px Arial, sans-serif';
  x.fillText('ultrawear-indoor.vercel.app', S / 2, 1036);

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
