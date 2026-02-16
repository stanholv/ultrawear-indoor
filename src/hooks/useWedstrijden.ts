import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Wedstrijd, WedstrijdFormData } from '../lib/types';

export const useWedstrijden = () => {
  const [wedstrijden, setWedstrijden] = useState<Wedstrijd[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch functie die we kunnen herbruiken
  const fetchWedstrijden = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wedstrijden')
        .select('*')
        .order('datum', { ascending: false });

      if (error) throw error;
      setWedstrijden(data || []);
    } catch (error) {
      console.error('Error fetching wedstrijden:', error);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWedstrijden();
  }, []);

  // Create wedstrijd
  const createWedstrijd = async (formData: WedstrijdFormData) => {
    try {
      // Insert wedstrijd
      const { data: wedstrijdData, error: wedstrijdError } = await supabase
        .from('wedstrijden')
        .insert({
          datum: formData.datum,
          tijd: formData.tijd,
          thuisploeg: formData.thuisploeg,
          uitploeg: formData.uitploeg,
          uitslag: formData.uitslag,
          type: formData.type,
          opmerkingen: formData.opmerkingen,
        })
        .select()
        .single();

      if (wedstrijdError) throw wedstrijdError;

      // Insert speler prestaties
      const spelersData = formData.spelers
        .filter(s => s.aanwezig)
        .map(speler => ({
          wedstrijd_id: wedstrijdData.id,
          speler_naam: speler.naam,
          aanwezig: speler.aanwezig,
          doelpunten: speler.doelpunten,
          penalty: speler.penalty,
          corner: speler.corner,
        }));

      if (spelersData.length > 0) {
        const { error: spelersError } = await supabase
          .from('speler_prestaties')
          .insert(spelersData);

        if (spelersError) throw spelersError;
      }

      // Refresh de lijst
      await fetchWedstrijden();

      return { success: true };
    } catch (error: any) {
      console.error('Error creating wedstrijd:', error);
      return { success: false, error: error.message };
    }
  };

  // Update wedstrijd
  const updateWedstrijd = async (id: string, data: Partial<Wedstrijd>) => {
    try {
      const { error } = await supabase
        .from('wedstrijden')
        .update({
          datum: data.datum,
          tijd: data.tijd,
          thuisploeg: data.thuisploeg,
          uitploeg: data.uitploeg,
          uitslag: data.uitslag,
          opmerkingen: data.opmerkingen,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh de lijst
      await fetchWedstrijden();

      return { success: true };
    } catch (error: any) {
      console.error('Error updating wedstrijd:', error);
      return { success: false, error: error.message };
    }
  };

  // Delete wedstrijd
  const deleteWedstrijd = async (id: string) => {
    try {
      // Eerst verwijderen we de gerelateerde speler_prestaties
      const { error: prestationsError } = await supabase
        .from('speler_prestaties')
        .delete()
        .eq('wedstrijd_id', id);

      if (prestationsError) throw prestationsError;

      // Dan verwijderen we de wedstrijd zelf
      const { error: wedstrijdError } = await supabase
        .from('wedstrijden')
        .delete()
        .eq('id', id);

      if (wedstrijdError) throw wedstrijdError;

      // Refresh de lijst
      await fetchWedstrijden();

      return { success: true };
    } catch (error: any) {
      console.error('Error deleting wedstrijd:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    wedstrijden,
    loading,
    createWedstrijd,
    updateWedstrijd,
    deleteWedstrijd,
    refreshWedstrijden: fetchWedstrijden, // Export deze ook voor handmatige refresh
  };
};