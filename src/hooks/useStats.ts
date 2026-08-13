import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AggregatedStats, SpelerStat, vandaagISO, isGespeeld, teltVoorStats } from '../lib/types';
import { seizoenVanWedstrijd } from '../lib/seizoen';
import { useSeizoen } from './useSeizoen';

// Sluit stats uit van wedstrijden in de toekomst (nog niet gespeeld), van
// forfaits (geen echte spelersprestaties) en van oefenwedstrijden (tellen niet
// mee voor de seizoensstatistieken).
const isGespeeldeStat = (s: SpelerStat): boolean => {
  const datum = s.wedstrijden?.datum;
  return !!datum && datum <= vandaagISO() && !s.wedstrijden?.forfait && teltVoorStats(s.wedstrijden?.type);
};

// Hoort deze stat bij het opgegeven seizoen?
const isSeizoenStat = (s: SpelerStat, seizoen: string): boolean =>
  seizoenVanWedstrijd({ seizoen: s.wedstrijden?.seizoen, datum: s.wedstrijden?.datum }) === seizoen;

// Aggregeer stats, optioneel gefilterd op wedstrijdtype
const aggregeerStats = (data: SpelerStat[]): AggregatedStats[] => {
  const aggregated: { [key: string]: AggregatedStats } = {};
  data?.forEach((stat) => {
    if (!aggregated[stat.speler_naam]) {
      aggregated[stat.speler_naam] = {
        speler_naam: stat.speler_naam,
        aanwezig: 0, doelpunten: 0, penalty: 0, corner: 0,
      };
    }
    if (stat.aanwezig) {
      aggregated[stat.speler_naam].aanwezig += 1;
      aggregated[stat.speler_naam].doelpunten += stat.doelpunten || 0;
      aggregated[stat.speler_naam].penalty += stat.penalty || 0;
      aggregated[stat.speler_naam].corner += stat.corner || 0;
    }
  });
  return Object.values(aggregated);
};

export const useStats = () => {
  const { seizoen } = useSeizoen();
  const [rawStats, setRawStats] = useState<SpelerStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('speler_stats').select('*, wedstrijden(datum, forfait, seizoen, type)');
      if (fetchError) throw fetchError;
      setRawStats(data || []);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const stats = useMemo(
    () => aggregeerStats(rawStats.filter(s => isGespeeldeStat(s) && isSeizoenStat(s, seizoen))),
    [rawStats, seizoen],
  );

  return { stats, loading, error, refetch: loadStats };
};

// Hook: gefilterde stats op wedstrijdtype (voor DetailedStats)
export const useFilteredStats = (filter: 'all' | 'competitie' | 'beker') => {
  const { seizoen } = useSeizoen();
  const [rawStats, setRawStats] = useState<SpelerStat[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('speler_stats')
      .select('*, wedstrijden(type, datum, forfait, seizoen)');

    const { data } = await query;
    setRawStats(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const stats = useMemo(() => {
    // Alleen gespeelde wedstrijden van het geselecteerde seizoen, daarna op type.
    const gespeeld = rawStats.filter(s => isGespeeldeStat(s) && isSeizoenStat(s, seizoen));
    const gefilterd = filter === 'all'
      ? gespeeld
      : gespeeld.filter((s) => s.wedstrijden?.type === filter);

    return aggregeerStats(gefilterd);
  }, [rawStats, filter, seizoen]);

  return { stats, loading };
};

// Hook: vorm indicator - laatste 5 wedstrijden met tegenstander
export const useSpelerForm = (spelerNaam: string) => {
  const [form, setForm] = useState<{
    wedstrijd_id: string;
    tegenstander: string;
    doelpunten: number;
    aanwezig: boolean;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!spelerNaam) return;
    const fetchForm = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('speler_stats')
        .select('wedstrijd_id, doelpunten, aanwezig, wedstrijden(datum, thuisploeg, uitploeg, uitslag)')
        .eq('speler_naam', spelerNaam)
        .eq('aanwezig', true);

      // Sorteer client-side op datum, neem laatste 5 (geen toekomstige)
      const mapped = (data || [])
        .filter((s: any) => s.wedstrijden?.datum && s.wedstrijden.datum <= vandaagISO())
        .map((s: any) => {
          const w = s.wedstrijden;
          const tegenstander = w?.thuisploeg === 'Ultrawear Indoor' ? w?.uitploeg : w?.thuisploeg;
          return {
            wedstrijd_id: s.wedstrijd_id,
            tegenstander: tegenstander || '?',
            datum: w?.datum || '',
            doelpunten: s.doelpunten || 0,
            aanwezig: s.aanwezig,
          };
        });

      // Sorteer op datum nieuwste eerst, neem laatste 5, dan omdraaien voor display (oud → nieuw links → rechts)
      mapped.sort((a: any, b: any) => new Date(b.datum).getTime() - new Date(a.datum).getTime());
      const laatste5 = mapped.slice(0, 5);
      setForm(laatste5);
      setLoading(false);
    };
    fetchForm();
  }, [spelerNaam]);

  return { form, loading };
};

// Hook: goals-per-wedstrijd van één speler (enkel gespeelde, niet-forfait matchen).
// Gebruikt voor badges zoals hat-trick / manita.
export const useSpelerMatchGoals = (spelerNaam: string) => {
  const [goals, setGoals] = useState<number[]>([]);

  useEffect(() => {
    if (!spelerNaam) return;
    (async () => {
      const { data } = await supabase
        .from('speler_stats')
        .select('doelpunten, wedstrijden(datum, uitslag, forfait)')
        .eq('speler_naam', spelerNaam);
      const played = (data || []).filter(
        (r: any) => r.wedstrijden && isGespeeld(r.wedstrijden.datum, r.wedstrijden.uitslag) && !r.wedstrijden.forfait
      );
      setGoals(played.map((r: any) => r.doelpunten || 0));
    })();
  }, [spelerNaam]);

  return goals;
};
