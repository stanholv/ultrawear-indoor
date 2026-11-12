import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { Wedstrijd, WedstrijdFormData } from '../lib/types';
import { seizoenVanDatum, seizoenVanWedstrijd } from '../lib/seizoen';
import { useSeizoen } from './useSeizoen';
import { useVisibilityRefresh } from './useVisibilityRefresh';

interface UseWedstrijdenOptions {
  /** Toon alle seizoenen i.p.v. alleen het geselecteerde (bv. admin-bewerken). */
  alleSeizoenen?: boolean;
}

export const useWedstrijden = (options: UseWedstrijdenOptions = {}) => {
  const { alleSeizoenen = false } = options;
  const { seizoen } = useSeizoen();
  const [alleWedstrijden, setAlleWedstrijden] = useState<Wedstrijd[]>([]);
  const [loading, setLoading] = useState(true);

  // Zichtbare lijst: alle seizoenen, of gefilterd op het geselecteerde seizoen.
  const wedstrijden = useMemo(
    () => (alleSeizoenen ? alleWedstrijden : alleWedstrijden.filter(w => seizoenVanWedstrijd(w) === seizoen)),
    [alleWedstrijden, alleSeizoenen, seizoen],
  );

  // Fetch functie die we kunnen herbruiken. `silent` laat de laadspinner weg
  // (voor een achtergrondvernieuwing wanneer de app weer actief wordt).
  const fetchWedstrijden = async ({ silent = false }: { silent?: boolean } = {}) => {
    try {
      if (!silent) setLoading(true);
      const { data, error } = await supabase
        .from('wedstrijden')
        .select('*')
        .order('datum', { ascending: false });

      if (error) throw error;
      setAlleWedstrijden(data || []);
    } catch (error: any) {
      console.error('Error fetching wedstrijden:', error.message);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchWedstrijden();
  }, []);

  // Opnieuw ophalen wanneer de app weer actief wordt (geïnstalleerde PWA) —
  // stil, zodat de reeds getoonde lijst niet door een laadspinner vervangen wordt.
  useVisibilityRefresh(() => fetchWedstrijden({ silent: true }));

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
          thuisscore: formData.thuisscore ?? null,
          uitscore: formData.uitscore ?? null,
          type: formData.type,
          forfait: formData.forfait ?? false,
          owngoals: formData.owngoals ?? 0,
          seizoen: formData.seizoen ?? seizoenVanDatum(formData.datum),
          opmerkingen: formData.opmerkingen,
        })
        .select()
        .single();

      if (wedstrijdError) throw wedstrijdError;

      // Insert speler prestaties (geen spelersstats bij een forfait)
      const spelersData = formData.forfait ? [] : formData.spelers
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
          .from('speler_stats')
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
          thuisscore: data.thuisscore ?? null,
          uitscore: data.uitscore ?? null,
          type: data.type,
          forfait: data.forfait ?? false,
          owngoals: data.owngoals ?? 0,
          seizoen: data.seizoen ?? seizoenVanDatum(data.datum),
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
      // Eerst verwijderen we de gerelateerde speler_stats
      const { error: prestationsError } = await supabase
        .from('speler_stats')
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
    wedstrijden,                 // gefilterd op geselecteerd seizoen (tenzij alleSeizoenen)
    alleWedstrijden,             // volledige lijst, alle seizoenen
    loading,
    createWedstrijd,
    updateWedstrijd,
    deleteWedstrijd,
    refreshWedstrijden: fetchWedstrijden, // Export deze ook voor handmatige refresh
  };
};