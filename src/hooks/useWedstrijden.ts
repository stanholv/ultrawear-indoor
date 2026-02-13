import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wedstrijd, WedstrijdFormData, SpelerStat } from '../lib/types';

export const useWedstrijden = () => {
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWedstrijden();
  }, []);

  const loadWedstrijden = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wedstrijden')
        .select('*')
        .order('datum', { ascending: false })
        .order('tijd', { ascending: false });

      if (error) throw error;
      setWedstrijden(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createWedstrijd = async (formData: WedstrijdFormData) => {
    try {
      // Insert wedstrijd
      const { data: wedstrijd, error: wedstrijdError } = await supabase
        .from('wedstrijden')
        .insert({
          datum: formData.datum,
          tijd: formData.tijd,
          thuisploeg: formData.thuisploeg,
          uitploeg: formData.uitploeg,
          uitslag: formData.uitslag,
          opmerkingen: formData.opmerkingen,
        })
        .select()
        .single();

      if (wedstrijdError) throw wedstrijdError;

      // Insert speler stats
      const statsToInsert: Omit<SpelerStat, 'id' | 'created_at'>[] = formData.spelers.map(speler => ({
        wedstrijd_id: wedstrijd.id,
        speler_naam: speler.naam,
        aanwezig: speler.aanwezig,
        doelpunten: speler.doelpunten,
        penalty: speler.penalty,
        corner: speler.corner,
      }));

      const { error: statsError } = await supabase
        .from('speler_stats')
        .insert(statsToInsert);

      if (statsError) throw statsError;

      await loadWedstrijden();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const updateWedstrijd = async (id: string, updates: Partial<Wedstrijd>) => {
    try {
      const { error } = await supabase
        .from('wedstrijden')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await loadWedstrijden();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const deleteWedstrijd = async (id: string) => {
    try {
      const { error } = await supabase
        .from('wedstrijden')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadWedstrijden();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  return {
    wedstrijden,
    loading,
    error,
    loadWedstrijden,
    createWedstrijd,
    updateWedstrijd,
    deleteWedstrijd,
  };
};
