import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PlayerProfile, Review } from '../lib/types';

// Hook: alle spelerprofielen ophalen
export const useProfiles = () => {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, speler_naam, rugnummer, positie, bio')
        .not('speler_naam', 'is', null)
        .order('speler_naam');

      if (error) {
        setError(error.message);
      } else {
        const mapped: PlayerProfile[] = (data || []).map(p => ({
          speler_naam: p.speler_naam!,
          rugnummer: p.rugnummer,
          positie: p.positie,
          bio: p.bio,
          profile_id: p.id,
          full_name: p.full_name,
        }));
        setProfiles(mapped);
      }
      setLoading(false);
    };

    fetchProfiles();
  }, []);

  return { profiles, loading, error };
};

// Hook: reviews voor één speler ophalen
export const useReviews = (spelerNaam: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [gemiddelde, setGemiddelde] = useState<number>(0);

  useEffect(() => {
    if (!spelerNaam) return;

    const fetchReviews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('speler_naam', spelerNaam)
        .order('created_at', { ascending: false });

      const reviewData = data || [];
      setReviews(reviewData);

      if (reviewData.length > 0) {
        const avg = reviewData.reduce((sum, r) => sum + r.score, 0) / reviewData.length;
        setGemiddelde(Math.round(avg * 10) / 10);
      } else {
        setGemiddelde(0);
      }
      setLoading(false);
    };

    fetchReviews();
  }, [spelerNaam]);

  // Review toevoegen
  const addReview = async (score: number, commentaar: string, reviewerNaam: string): Promise<{ success: boolean; error?: string }> => {
    // IP ophalen via public API
    let ip = 'unknown';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const json = await res.json();
      ip = json.ip;
    } catch {
      // fallback: geen IP
    }

    // Check: max 1 review per IP per speler per uur
    const eenUurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: bestaande } = await supabase
      .from('reviews')
      .select('id')
      .eq('speler_naam', spelerNaam)
      .eq('ip_adres', ip)
      .gte('created_at', eenUurGeleden);

    if (bestaande && bestaande.length > 0) {
      return { success: false, error: 'Je hebt deze speler al beoordeeld. Probeer het over een uur opnieuw.' };
    }

    const { error } = await supabase.from('reviews').insert({
      speler_naam: spelerNaam,
      score,
      commentaar: commentaar.trim() || null,
      reviewer_naam: reviewerNaam.trim(),
      ip_adres: ip,
    });

    if (error) return { success: false, error: error.message };

    // Refresh reviews
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('speler_naam', spelerNaam)
      .order('created_at', { ascending: false });

    const reviewData = data || [];
    setReviews(reviewData);
    if (reviewData.length > 0) {
      const avg = reviewData.reduce((sum, r) => sum + r.score, 0) / reviewData.length;
      setGemiddelde(Math.round(avg * 10) / 10);
    }

    return { success: true };
  };

  return { reviews, loading, gemiddelde, addReview };
};

// Hook: profiel van ingelogde speler updaten
export const useUpdateProfile = () => {
  const updateProfile = async (
    profileId: string,
    data: { rugnummer?: number; positie?: string; bio?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', profileId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  return { updateProfile };
};
