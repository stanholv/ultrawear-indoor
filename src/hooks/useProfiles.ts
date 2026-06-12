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
      // Inserts go through a SECURITY DEFINER RPC that derives the IP
      // server-side and enforces the per-IP/hour rate limit, so the spam
      // check can't be bypassed from the client.
      const { error } = await supabase.rpc('submit_review', {
        p_speler_naam: spelerNaam,
        p_score: score,
        p_commentaar: commentaar,
        p_reviewer_naam: reviewerNaam,
      });

      // Rate-limit and validation failures arrive as Postgres exceptions.
      if (error) return { success: false, error: error.message };

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
