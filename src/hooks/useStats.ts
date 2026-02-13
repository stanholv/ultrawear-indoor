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
      const { data, error } = await supabase
        .from('speler_stats')
        .select('*');

      if (error) throw error;

      // Aggregate stats per speler
      const aggregated: { [key: string]: AggregatedStats } = {};
      
      data?.forEach(stat => {
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
          aggregated[stat.speler_naam].aanwezig++;
        }
        aggregated[stat.speler_naam].doelpunten += stat.doelpunten;
        aggregated[stat.speler_naam].penalty += stat.penalty;
        aggregated[stat.speler_naam].corner += stat.corner;
      });

      // Convert to array and sort by doelpunten
      const statsArray = Object.values(aggregated).sort((a, b) => {
        if (b.doelpunten === a.doelpunten) {
          return b.aanwezig - a.aanwezig;
        }
        return b.doelpunten - a.doelpunten;
      });

      setStats(statsArray);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    loadStats,
  };
};
