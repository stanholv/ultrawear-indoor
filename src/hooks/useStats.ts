import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AggregatedStats } from '../lib/types';

export const useStats = () => {
  const [stats, setStats] = useState<AggregatedStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      
      // Haal alle speler stats op
      const { data, error: fetchError } = await supabase
        .from('speler_stats')
        .select('*');

      if (fetchError) throw fetchError;

      // Aggregeer per speler
      const aggregated: { [key: string]: AggregatedStats } = {};

      data?.forEach((stat) => {
        if (!aggregated[stat.speler_naam]) {
          aggregated[stat.speler_naam] = {
            speler_naam: stat.speler_naam,
            aanwezig: 0,
            doelpunten: 0,
            penalty: 0,
            corner: 0,
          };
        }

        if (stat.aanwezig) {
          aggregated[stat.speler_naam].aanwezig += 1;
          aggregated[stat.speler_naam].doelpunten += stat.doelpunten || 0;
          aggregated[stat.speler_naam].penalty += stat.penalty || 0;
          aggregated[stat.speler_naam].corner += stat.corner || 0;
        }
      });

      const statsArray = Object.values(aggregated);
      setStats(statsArray);
      setError(null);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading, error, refetch: loadStats };
};
