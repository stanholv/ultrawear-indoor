import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';

// ================================================
// FINANCIËN HOOK
// ================================================
// Laadt het volledige financiële departement voor één seizoen en biedt CRUD.
// Alles is admin-only (RLS), dus deze hook hoort enkel op de admin-pagina thuis.
//
//   * leden           → seizoensonafhankelijk (contact/administratie)
//   * fin_categorieen → seizoensonafhankelijk (in-/uitgavecategorieën)
//   * inschrijvingen  → per seizoen (bevestigd + verwacht lidgeld)
//   * fin_transacties → per seizoen (het kasboek)
//   * startsaldo      → per seizoen (fin_seizoenen)
//
// "Wie moet nog betalen" wordt hier afgeleid: verwacht_lidgeld − som van de
// lidgeld-transacties voor dat lid/seizoen.

export interface Categorie {
  id: string;
  naam: string;
  richting: 'in' | 'uit';
  is_lidgeld: boolean;
  volgorde: number;
  actief: boolean;
}

export interface Lid {
  id: string;
  naam: string;
  speler_id: string | null;
  adres: string | null;
  geboortedatum: string | null;
  telefoon: string | null;
  actief: boolean;
  speler_naam?: string | null;   // afgeleid uit join met spelers
  speler_actief?: boolean | null; // roster-status van de gekoppelde speler (null = niet gekoppeld)
}

export interface Inschrijving {
  id: string;
  lid_id: string;
  seizoen: string;
  bevestigd: boolean;
  verwacht_lidgeld: number | null;
}

export interface Transactie {
  id: string;
  seizoen: string;
  datum: string;
  categorie_id: string;
  bedrag: number;
  lid_id: string | null;
  omschrijving: string | null;
  created_at: string;
  categorie_naam?: string;
  categorie_richting?: 'in' | 'uit';
  lid_naam?: string | null;
}

type Result = { success: boolean; error?: string };

export const useFinancien = (seizoen: string) => {
  const [leden, setLeden] = useState<Lid[]>([]);
  const [categorieen, setCategorieen] = useState<Categorie[]>([]);
  const [inschrijvingen, setInschrijvingen] = useState<Inschrijving[]>([]);
  const [transacties, setTransacties] = useState<Transactie[]>([]);
  const [startsaldo, setStartsaldoState] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Laden ──────────────────────────────────────────────────────────────────

  const loadLeden = useCallback(async () => {
    const { data, error } = await supabase
      .from('leden')
      .select('*, spelers(naam, actief)')
      .order('naam', { ascending: true });
    if (error) throw error;
    setLeden(
      (data || []).map((r: any) => ({
        ...r,
        speler_naam: r.spelers?.naam ?? null,
        speler_actief: r.spelers?.actief ?? null,
      })),
    );
  }, []);

  const loadCategorieen = useCallback(async () => {
    const { data, error } = await supabase
      .from('fin_categorieen')
      .select('*')
      .order('richting', { ascending: true })
      .order('volgorde', { ascending: true });
    if (error) throw error;
    setCategorieen((data || []) as Categorie[]);
  }, []);

  const loadInschrijvingen = useCallback(async () => {
    const { data, error } = await supabase
      .from('inschrijvingen')
      .select('*')
      .eq('seizoen', seizoen);
    if (error) throw error;
    setInschrijvingen((data || []) as Inschrijving[]);
  }, [seizoen]);

  const loadTransacties = useCallback(async () => {
    const { data, error } = await supabase
      .from('fin_transacties')
      .select('*, fin_categorieen(naam, richting), leden(naam)')
      .eq('seizoen', seizoen)
      .order('datum', { ascending: false })
      .order('created_at', { ascending: false });
    if (error) throw error;
    setTransacties(
      (data || []).map((r: any) => ({
        ...r,
        bedrag: Number(r.bedrag),
        categorie_naam: r.fin_categorieen?.naam,
        categorie_richting: r.fin_categorieen?.richting,
        lid_naam: r.leden?.naam ?? null,
      })),
    );
  }, [seizoen]);

  const loadSaldo = useCallback(async () => {
    const { data, error } = await supabase
      .from('fin_seizoenen')
      .select('startsaldo')
      .eq('seizoen', seizoen)
      .maybeSingle();
    if (error) throw error;
    setStartsaldoState(data ? Number(data.startsaldo) : 0);
  }, [seizoen]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        loadLeden(),
        loadCategorieen(),
        loadInschrijvingen(),
        loadTransacties(),
        loadSaldo(),
      ]);
    } catch (e: any) {
      setError(e?.message || 'Kon financiële gegevens niet laden');
    } finally {
      setLoading(false);
    }
  }, [loadLeden, loadCategorieen, loadInschrijvingen, loadTransacties, loadSaldo]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Afgeleide waarden ────────────────────────────────────────────────────────

  const lidgeldCategorieId = useMemo(
    () => categorieen.find((c) => c.is_lidgeld)?.id ?? null,
    [categorieen],
  );

  const saldo = useMemo(() => {
    const inkomsten = transacties
      .filter((t) => t.categorie_richting === 'in')
      .reduce((s, t) => s + t.bedrag, 0);
    const uitgaven = transacties
      .filter((t) => t.categorie_richting === 'uit')
      .reduce((s, t) => s + t.bedrag, 0);
    return { startsaldo, inkomsten, uitgaven, eindsaldo: startsaldo + inkomsten - uitgaven };
  }, [transacties, startsaldo]);

  // Per lid: betaald lidgeld (som lidgeld-transacties) en verwacht bedrag.
  const lidgeldBetaald = useMemo(() => {
    const map = new Map<string, number>();
    if (!lidgeldCategorieId) return map;
    for (const t of transacties) {
      if (t.categorie_id === lidgeldCategorieId && t.lid_id) {
        map.set(t.lid_id, (map.get(t.lid_id) || 0) + t.bedrag);
      }
    }
    return map;
  }, [transacties, lidgeldCategorieId]);

  // Openstaand loon per lener (lening ontvangen − terugbetaald), per lid.
  const openstaandeLeningen = useMemo(() => {
    const leningCat = categorieen.find((c) => c.richting === 'in' && c.naam.toLowerCase() === 'lening');
    const terugCat = categorieen.find((c) => c.richting === 'uit' && c.naam.toLowerCase().includes('terugbetaling'));
    const map = new Map<string, number>();
    for (const t of transacties) {
      if (!t.lid_id) continue;
      if (leningCat && t.categorie_id === leningCat.id) map.set(t.lid_id, (map.get(t.lid_id) || 0) + t.bedrag);
      if (terugCat && t.categorie_id === terugCat.id) map.set(t.lid_id, (map.get(t.lid_id) || 0) - t.bedrag);
    }
    return map;
  }, [transacties, categorieen]);

  // ── Acties: leden ────────────────────────────────────────────────────────────

  const addLid = useCallback(async (payload: Partial<Lid> & { naam: string }): Promise<Result> => {
    const { error } = await supabase.from('leden').insert({
      naam: payload.naam.trim(),
      speler_id: payload.speler_id || null,
      adres: payload.adres || null,
      geboortedatum: payload.geboortedatum || null,
      telefoon: payload.telefoon || null,
      actief: payload.actief ?? true,
    });
    if (error) return { success: false, error: error.message };
    await loadLeden();
    return { success: true };
  }, [loadLeden]);

  const updateLid = useCallback(async (id: string, patch: Partial<Lid>): Promise<Result> => {
    const clean: Record<string, unknown> = {};
    for (const k of ['naam', 'speler_id', 'adres', 'geboortedatum', 'telefoon', 'actief'] as const) {
      if (k in patch) clean[k] = (patch as any)[k] === '' ? null : (patch as any)[k];
    }
    const { error } = await supabase.from('leden').update(clean).eq('id', id);
    if (error) return { success: false, error: error.message };
    await loadLeden();
    return { success: true };
  }, [loadLeden]);

  const deleteLid = useCallback(async (id: string): Promise<Result> => {
    const { error } = await supabase.from('leden').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    await Promise.all([loadLeden(), loadInschrijvingen(), loadTransacties()]);
    return { success: true };
  }, [loadLeden, loadInschrijvingen, loadTransacties]);

  // ── Acties: categorieën ──────────────────────────────────────────────────────

  const addCategorie = useCallback(async (naam: string, richting: 'in' | 'uit'): Promise<Result> => {
    const volgende = Math.max(0, ...categorieen.filter((c) => c.richting === richting).map((c) => c.volgorde)) + 1;
    const { error } = await supabase
      .from('fin_categorieen')
      .insert({ naam: naam.trim(), richting, volgorde: volgende });
    if (error) return { success: false, error: error.message };
    await loadCategorieen();
    return { success: true };
  }, [categorieen, loadCategorieen]);

  const updateCategorie = useCallback(async (id: string, patch: Partial<Pick<Categorie, 'naam' | 'actief'>>): Promise<Result> => {
    const { error } = await supabase.from('fin_categorieen').update(patch).eq('id', id);
    if (error) return { success: false, error: error.message };
    await loadCategorieen();
    return { success: true };
  }, [loadCategorieen]);

  // ── Acties: inschrijvingen ────────────────────────────────────────────────────

  const upsertInschrijving = useCallback(async (
    lid_id: string,
    patch: Partial<Pick<Inschrijving, 'bevestigd' | 'verwacht_lidgeld'>>,
  ): Promise<Result> => {
    const { error } = await supabase
      .from('inschrijvingen')
      .upsert({ lid_id, seizoen, ...patch }, { onConflict: 'lid_id,seizoen' });
    if (error) return { success: false, error: error.message };
    await loadInschrijvingen();
    return { success: true };
  }, [seizoen, loadInschrijvingen]);

  // ── Acties: kasboek ──────────────────────────────────────────────────────────

  const addTransactie = useCallback(async (payload: {
    datum: string;
    categorie_id: string;
    bedrag: number;
    lid_id?: string | null;
    omschrijving?: string | null;
  }): Promise<Result> => {
    const { error } = await supabase.from('fin_transacties').insert({
      seizoen,
      datum: payload.datum,
      categorie_id: payload.categorie_id,
      bedrag: payload.bedrag,
      lid_id: payload.lid_id || null,
      omschrijving: payload.omschrijving || null,
    });
    if (error) return { success: false, error: error.message };
    await loadTransacties();
    return { success: true };
  }, [seizoen, loadTransacties]);

  const deleteTransactie = useCallback(async (id: string): Promise<Result> => {
    const { error } = await supabase.from('fin_transacties').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    await loadTransacties();
    return { success: true };
  }, [loadTransacties]);

  const setStartsaldo = useCallback(async (bedrag: number): Promise<Result> => {
    const { error } = await supabase
      .from('fin_seizoenen')
      .upsert({ seizoen, startsaldo: bedrag }, { onConflict: 'seizoen' });
    if (error) return { success: false, error: error.message };
    setStartsaldoState(bedrag);
    return { success: true };
  }, [seizoen]);

  return {
    // data
    leden,
    categorieen,
    inschrijvingen,
    transacties,
    loading,
    error,
    // afgeleid
    saldo,
    lidgeldCategorieId,
    lidgeldBetaald,
    openstaandeLeningen,
    // acties
    addLid,
    updateLid,
    deleteLid,
    addCategorie,
    updateCategorie,
    upsertInschrijving,
    addTransactie,
    deleteTransactie,
    setStartsaldo,
    refetch: loadAll,
  };
};
