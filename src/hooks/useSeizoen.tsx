import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { HUIDIG_SEIZOEN, beschikbareSeizoenen } from '../lib/seizoen';

// ================================================
// SEIZOEN CONTEXT
// ================================================
// Houdt het geselecteerde seizoen bij en de lijst met beschikbare seizoenen
// (afgeleid uit de wedstrijden). Alle publieke overzichten (statistieken,
// uitslagen, records, spelersprofielen) filteren op het geselecteerde seizoen.
//
// Standaard staat het meest recente seizoen geselecteerd. Zodra er data voor
// een nieuw seizoen wordt toegevoegd, verschijnt dat vanzelf in de selector en
// wordt het de nieuwe standaard.

interface SeizoenValue {
  seizoen: string;                       // geselecteerd seizoen
  setSeizoen: (s: string) => void;
  seizoenen: string[];                   // beschikbaar, nieuw → oud
  loading: boolean;
  refresh: () => void;
}

const SeizoenContext = createContext<SeizoenValue | undefined>(undefined);

export const SeizoenProvider = ({ children }: { children: ReactNode }) => {
  const [seizoenen, setSeizoenen] = useState<string[]>([HUIDIG_SEIZOEN]);
  const [seizoen, setSeizoenState] = useState<string>(HUIDIG_SEIZOEN);
  const [loading, setLoading] = useState(true);
  // Onthoudt of de gebruiker zelf een seizoen koos, zodat we de standaard niet
  // overschrijven nadat de lijst (async) geladen is.
  const [handmatigGekozen, setHandmatigGekozen] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const { data } = await supabase.from('wedstrijden').select('seizoen');
      const lijst = beschikbareSeizoenen((data || []).map((r: { seizoen?: string }) => r.seizoen));
      setSeizoenen(lijst);
      // Standaard: meest recente seizoen — tenzij de gebruiker al koos.
      setSeizoenState(prev => (handmatigGekozen ? prev : lijst[0]));
    } catch {
      /* stil falen — dan blijft alleen HUIDIG_SEIZOEN over */
    } finally {
      setLoading(false);
    }
  }, [handmatigGekozen]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setSeizoen = useCallback((s: string) => {
    setHandmatigGekozen(true);
    setSeizoenState(s);
  }, []);

  return (
    <SeizoenContext.Provider value={{ seizoen, setSeizoen, seizoenen, loading, refresh }}>
      {children}
    </SeizoenContext.Provider>
  );
};

export const useSeizoen = () => {
  const ctx = useContext(SeizoenContext);
  if (!ctx) throw new Error('useSeizoen must be used within SeizoenProvider');
  return ctx;
};
