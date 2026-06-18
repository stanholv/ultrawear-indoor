import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

type Section = 'reviews' | 'uitslagen';

const KEY = (s: Section) => `lastSeen:${s}`;

// Laatst-gezien tijdstip per sectie. Bij allereerste gebruik = nu (zodat je niet
// meteen een badge met alle bestaande items krijgt).
const getLastSeen = (s: Section): string => {
  let v = localStorage.getItem(KEY(s));
  if (!v) {
    v = new Date().toISOString();
    localStorage.setItem(KEY(s), v);
  }
  return v;
};

interface BadgesValue {
  reviews: number;
  uitslagen: number;
  markSeen: (s: Section) => void;
  refresh: () => void;
}

const BadgesContext = createContext<BadgesValue | undefined>(undefined);

export const BadgesProvider = ({ children }: { children: ReactNode }) => {
  const [reviews, setReviews] = useState(0);
  const [uitslagen, setUitslagen] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Nieuwe reviews sinds laatst gezien
      const r = await supabase
        .from('reviews')
        .select('id', { count: 'exact', head: true })
        .gt('created_at', getLastSeen('reviews'));
      setReviews(r.count || 0);

      // Nieuwe/gewijzigde uitslagen (gespeeld, met uitslag) sinds laatst gezien
      const u = await supabase
        .from('wedstrijden')
        .select('id', { count: 'exact', head: true })
        .not('uitslag', 'is', null)
        .neq('uitslag', '-')
        .lte('datum', today)
        .gt('updated_at', getLastSeen('uitslagen'));
      setUitslagen(u.count || 0);
    } catch {
      /* stil falen — badges zijn niet kritisch */
    }
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onFocus);
    };
  }, [refresh]);

  // Totaal als cijfertje op het app-icoon (geïnstalleerde PWA, Badging-API)
  useEffect(() => {
    const total = reviews + uitslagen;
    const nav = navigator as any;
    if ('setAppBadge' in navigator) {
      if (total > 0) nav.setAppBadge(total).catch(() => {});
      else nav.clearAppBadge?.().catch(() => {});
    }
  }, [reviews, uitslagen]);

  const markSeen = useCallback((s: Section) => {
    localStorage.setItem(KEY(s), new Date().toISOString());
    if (s === 'reviews') setReviews(0);
    if (s === 'uitslagen') setUitslagen(0);
  }, []);

  return (
    <BadgesContext.Provider value={{ reviews, uitslagen, markSeen, refresh }}>
      {children}
    </BadgesContext.Provider>
  );
};

export const useBadges = () => {
  const ctx = useContext(BadgesContext);
  if (!ctx) throw new Error('useBadges must be used within BadgesProvider');
  return ctx;
};
