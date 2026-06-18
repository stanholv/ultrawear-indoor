import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';
import { useWedstrijden } from '../hooks/useWedstrijden';
import { isGespeeld } from '../lib/types';
import { supabase } from '../lib/supabase';

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' });

interface RecordItem {
  icon: string;
  label: string;
  value: string;
  detail?: string;
}

const MAANDEN = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export const RecordsPage = () => {
  const { wedstrijden, loading } = useWedstrijden();
  const [statsRows, setStatsRows] = useState<any[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('speler_stats')
        .select('wedstrijd_id, speler_naam, doelpunten, aanwezig, wedstrijden(datum, thuisploeg, uitploeg, uitslag, forfait)');
      setStatsRows(data || []);
      setStatsLoading(false);
    })();
  }, []);

  const records = useMemo<RecordItem[]>(() => {
    const played = wedstrijden
      .filter(w => isGespeeld(w.datum, w.uitslag) && !w.forfait)
      .map(w => {
        const isThuis = w.thuisploeg === 'Ultrawear Indoor';
        const [a, b] = (w.uitslag || '').split('-').map(Number);
        const ultra = isThuis ? a : b;
        const tegen = isThuis ? b : a;
        return {
          ...w,
          ultra, tegen,
          opp: isThuis ? w.uitploeg : w.thuisploeg,
          diff: ultra - tegen,
          totaal: ultra + tegen,
          res: ultra > tegen ? 'W' : ultra === tegen ? 'D' : 'L',
        };
      })
      .sort((x, y) => x.datum.localeCompare(y.datum));

    if (played.length === 0) return [];

    const out: RecordItem[] = [];

    // Grootste overwinning
    const wins = played.filter(m => m.res === 'W');
    if (wins.length) {
      const best = [...wins].sort((x, y) => y.diff - x.diff || y.ultra - x.ultra)[0];
      out.push({ icon: '🏆', label: 'Grootste overwinning', value: `${best.ultra}–${best.tegen}`, detail: `vs ${best.opp} · ${fmtDate(best.datum)}` });
    }

    // Meeste goals in één match
    const meest = [...played].sort((x, y) => y.ultra - x.ultra)[0];
    out.push({ icon: '⚽', label: 'Meeste goals in een match', value: `${meest.ultra}`, detail: `${meest.ultra}–${meest.tegen} vs ${meest.opp} · ${fmtDate(meest.datum)}` });

    // Spektakelmatch (meeste goals totaal)
    const spektakel = [...played].sort((x, y) => y.totaal - x.totaal)[0];
    out.push({ icon: '🎆', label: 'Spektakelmatch', value: `${spektakel.totaal} goals`, detail: `${spektakel.ultra}–${spektakel.tegen} vs ${spektakel.opp} · ${fmtDate(spektakel.datum)}` });

    // Langste ongeslagen reeks + langste winreeks
    let unbeaten = 0, maxUnbeaten = 0, winStreak = 0, maxWin = 0;
    for (const m of played) {
      unbeaten = m.res !== 'L' ? unbeaten + 1 : 0;
      maxUnbeaten = Math.max(maxUnbeaten, unbeaten);
      winStreak = m.res === 'W' ? winStreak + 1 : 0;
      maxWin = Math.max(maxWin, winStreak);
    }
    out.push({ icon: '🔥', label: 'Langste ongeslagen reeks', value: `${maxUnbeaten} matchen` });
    out.push({ icon: '📈', label: 'Langste winreeks', value: `${maxWin} matchen` });

    // Clean sheets
    const cleanSheets = played.filter(m => m.tegen === 0).length;
    out.push({ icon: '🧤', label: 'Clean sheets', value: `${cleanSheets}`, detail: 'matchen zonder tegengoal' });

    // Productiefste maand (meeste goals)
    const perMaand: Record<string, number> = {};
    played.forEach(m => {
      const key = m.datum.slice(0, 7); // YYYY-MM
      perMaand[key] = (perMaand[key] || 0) + m.ultra;
    });
    const topMaand = Object.entries(perMaand).sort((a, b) => b[1] - a[1])[0];
    if (topMaand) {
      const [y, mm] = topMaand[0].split('-');
      out.push({ icon: '📅', label: 'Productiefste maand', value: `${topMaand[1]} goals`, detail: `${MAANDEN[+mm - 1]} ${y}` });
    }

    return out;
  }, [wedstrijden]);

  // Speler-records uit speler_stats (gespeelde, niet-forfait matchen)
  const spelerRecords = useMemo<RecordItem[]>(() => {
    const sr = statsRows.filter(r => r.wedstrijden && isGespeeld(r.wedstrijden.datum, r.wedstrijden.uitslag) && !r.wedstrijden.forfait);
    if (sr.length === 0) return [];
    const out: RecordItem[] = [];

    // Beste individuele match
    const best = [...sr].filter(r => r.doelpunten > 0).sort((a, b) => b.doelpunten - a.doelpunten)[0];
    if (best) {
      const w = best.wedstrijden;
      const opp = w.thuisploeg === 'Ultrawear Indoor' ? w.uitploeg : w.thuisploeg;
      out.push({ icon: '⭐', label: 'Beste individuele match', value: `${best.speler_naam} · ${best.doelpunten}`, detail: `vs ${opp} · ${fmtDate(w.datum)}` });
    }

    // Hoogste opkomst
    const perMatch: Record<string, { aanwezig: number; w: any }> = {};
    sr.forEach(r => {
      const e = perMatch[r.wedstrijd_id] || { aanwezig: 0, w: r.wedstrijden };
      if (r.aanwezig) e.aanwezig += 1;
      perMatch[r.wedstrijd_id] = e;
    });
    const top = Object.values(perMatch).sort((a, b) => b.aanwezig - a.aanwezig)[0];
    if (top) {
      const opp = top.w.thuisploeg === 'Ultrawear Indoor' ? top.w.uitploeg : top.w.thuisploeg;
      out.push({ icon: '👥', label: 'Hoogste opkomst', value: `${top.aanwezig} spelers`, detail: `vs ${opp} · ${fmtDate(top.w.datum)}` });
    }

    return out;
  }, [statsRows]);

  const alle = [...records, ...spelerRecords];

  if (loading || statsLoading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="animate-pulse">Laden...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="page-header">
          <h1 className="page-title"><Award size={32} /> Records & wist-je-datjes</h1>
          <p className="page-subtitle">De opvallendste cijfers van het seizoen</p>
        </div>

        {alle.length === 0 ? (
          <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Nog te weinig gespeelde wedstrijden voor records.
          </div>
        ) : (
          <div className="stats-grid">
            {alle.map((r, i) => (
              <motion.div
                key={r.label}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="stat-card-header">
                  <div style={{ minWidth: 0 }}>
                    <div className="stat-label">{r.label}</div>
                    <div className="stat-value" style={{ fontSize: '1.4rem' }}>{r.value}</div>
                    {r.detail && <div className="stat-detail">{r.detail}</div>}
                  </div>
                  <div style={{ fontSize: '1.75rem', flexShrink: 0 }}>{r.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
