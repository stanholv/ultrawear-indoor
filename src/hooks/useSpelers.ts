import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SPELERS } from '../lib/types';

// ================================================
// SPELERS (ROSTER) HOOK
// ================================================
// Leest de selectie uit de `spelers`-tabel. Bestaat de tabel nog niet of is hij
// leeg (bv. vóór de migratie supabase-spelers.sql), dan valt de hook terug op de
// ingebouwde SPELERS-lijst, zodat de app blijft werken. Schrijfacties (toevoegen,
// activeren/deactiveren, verwijderen) vereisen wél de tabel + admin-rechten.

export interface Speler {
  id: string;
  naam: string;
  actief: boolean;
  volgorde: number;
}

// Terugvalselectie uit de constante (read-only): geen echte id's.
const fallbackSpelers = (): Speler[] =>
  SPELERS.map((naam, i) => ({ id: `fallback:${naam}`, naam, actief: true, volgorde: i + 1 }));

const isFallback = (s: Speler) => s.id.startsWith('fallback:');

export const useSpelers = () => {
  const [spelers, setSpelers] = useState<Speler[]>(fallbackSpelers());
  const [loading, setLoading] = useState(true);
  const [tabelAanwezig, setTabelAanwezig] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('spelers')
        .select('*')
        .order('volgorde', { ascending: true })
        .order('naam', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) {
        setSpelers(data as Speler[]);
        setTabelAanwezig(true);
      } else {
        // Tabel bestaat maar is leeg → toon terugval, maar sta CRUD toe.
        setSpelers(fallbackSpelers());
        setTabelAanwezig(!error);
      }
    } catch {
      // Tabel ontbreekt (nog geen migratie) → terugval, read-only.
      setSpelers(fallbackSpelers());
      setTabelAanwezig(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addSpeler = useCallback(async (naam: string) => {
    const schoon = naam.trim();
    if (!schoon) return { success: false, error: 'Naam is leeg' };
    const volgende = Math.max(0, ...spelers.map(s => s.volgorde)) + 1;
    const { error } = await supabase.from('spelers').insert({ naam: schoon, volgorde: volgende });
    if (error) return { success: false, error: error.message };
    await load();
    return { success: true };
  }, [spelers, load]);

  const setActief = useCallback(async (id: string, actief: boolean) => {
    if (id.startsWith('fallback:')) return { success: false, error: 'Voer eerst de spelers-migratie uit' };
    const { error } = await supabase.from('spelers').update({ actief }).eq('id', id);
    if (error) return { success: false, error: error.message };
    await load();
    return { success: true };
  }, [load]);

  const verwijderSpeler = useCallback(async (id: string) => {
    if (id.startsWith('fallback:')) return { success: false, error: 'Voer eerst de spelers-migratie uit' };
    const { error } = await supabase.from('spelers').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    await load();
    return { success: true };
  }, [load]);

  const actieveNamen = spelers.filter(s => s.actief).map(s => s.naam);
  const alleNamen = spelers.map(s => s.naam);

  return {
    spelers,
    actieveNamen,
    alleNamen,
    loading,
    tabelAanwezig,
    heeftFallback: spelers.some(isFallback),
    addSpeler,
    setActief,
    verwijderSpeler,
    refetch: load,
  };
};
