import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AggregatedStats } from '../lib/types';

// Aggregeer stats, optioneel gefilterd op wedstrijdtype
const aggregeerStats = (data: any[]): AggregatedStats[] => {
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
  const [stats, setStats] = useState<AggregatedStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('speler_stats').select('*');
      if (fetchError) throw fetchError;
      setStats(aggregeerStats(data || []));
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: loadStats };
};

// Hook: gefilterde stats op wedstrijdtype (voor DetailedStats)
export const useFilteredStats = (filter: 'all' | 'competitie' | 'beker') => {
  const [stats, setStats] = useState<AggregatedStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      let query = supabase
        .from('speler_stats')
        .select('*, wedstrijden(type)');

      const { data } = await query;

      // Filter op type indien nodig
      const gefilterd = filter === 'all'
        ? (data || [])
        : (data || []).filter((s: any) => s.wedstrijden?.type === filter);

      setStats(aggregeerStats(gefilterd));
      setLoading(false);
    };
    load();
  }, [filter]);

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

      // Sorteer client-side op datum, neem laatste 5
      const mapped = (data || [])
        .filter((s: any) => s.wedstrijden?.datum) // alleen wedstrijden met datum
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
