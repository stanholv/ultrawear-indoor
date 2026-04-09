import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Profile, Review } from '../lib/types';

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfiles = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .not('speler_naam', 'is', null) // alleen gekoppelde spelers
        .order('speler_naam');
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error loading profiles:', error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfiles();
  }, [loadProfiles]);

  return { profiles, loading, refetch: loadProfiles };
};

export const useReviews = (spelerNaam?: string) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (spelerNaam) {
        query = query.eq('speler_naam', spelerNaam);
      }

      const { data, error } = await query;
      if (error) throw error;
      setReviews(data || []);
    } catch (error: any) {
      console.error('Error loading reviews:', error.message);
    } finally {
      setLoading(false);
    }
  }, [spelerNaam]);

  const addReview = useCallback(async (
    score: number,
    commentaar: string,
    reviewerNaam: string
  ) => {
    if (!spelerNaam) return { success: false, error: 'Geen speler opgegeven' };

    try {
      // IP ophalen
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const { ip } = await ipResponse.json();

      // Spam check: max 1 review per IP per speler per uur
      const eenUurGeleden = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { data: bestaande } = await supabase
        .from('reviews')
        .select('id')
        .eq('speler_naam', spelerNaam)
        .eq('ip_adres', ip)
        .gte('created_at', eenUurGeleden);

      if (bestaande && bestaande.length > 0) {
        return { success: false, error: 'Je hebt al een review achtergelaten voor deze speler.' };
      }

      const { error } = await supabase
        .from('reviews')
        .insert({
          speler_naam: spelerNaam,
          score,
          commentaar,
          reviewer_naam: reviewerNaam,
          ip_adres: ip,
        });

      if (error) throw error;
      await loadReviews();
      return { success: true };
    } catch (error: any) {
      console.error('Error adding review:', error.message);
      return { success: false, error: error.message };
    }
  }, [spelerNaam, loadReviews]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const gemiddelde = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.score, 0) / reviews.length
    : 0;

  return { reviews, gemiddelde, addReview, loading, refetch: loadReviews };
};

export const useUpdateProfile = () => {
  const updateProfile = useCallback(async (id: string, updates: Partial<Profile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', id);
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      return { success: false, error: error.message };
    }
  }, []);

  return { updateProfile };
};
