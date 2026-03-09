import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Star, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  speler_naam: string;
  score: number;
  commentaar?: string;
  reviewer_naam?: string;
  created_at: string;
}

const StarDisplay = ({ score }: { score: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={14} fill={score >= i ? '#f59e0b' : 'none'} color={score >= i ? '#f59e0b' : 'var(--color-border)'} />
    ))}
  </div>
);

export const ReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSpeler, setFilterSpeler] = useState('');
  const [sorteer, setSorteer] = useState<'datum' | 'score'>('datum');

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('reviews')
        .select('id, speler_naam, score, commentaar, reviewer_naam, created_at')
        .order('created_at', { ascending: false });
      setReviews(data || []);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const spelers = [...new Set(reviews.map(r => r.speler_naam))].sort();

  const gefilterd = reviews
    .filter(r => !filterSpeler || r.speler_naam === filterSpeler)
    .sort((a, b) => {
      if (sorteer === 'score') return b.score - a.score;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  // Gemiddelde per speler voor de header stat
  const totaalReviews = reviews.length;
  const gemiddeldeAlles = totaalReviews > 0
    ? (reviews.reduce((s, r) => s + r.score, 0) / totaalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">
              <Star size={28} color="#f59e0b" fill="#f59e0b" /> Reviews
            </h1>
            <p className="page-subtitle">
              {totaalReviews} reviews · gemiddeld {gemiddeldeAlles} ⭐
            </p>
          </div>
        </div>

        {/* Filter + Sorteer balk */}
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)', padding: 'var(--spacing-md) var(--spacing-lg)' }}>
          <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center', flexWrap: 'wrap' }}>
            <Filter size={16} color="var(--color-text-secondary)" />

            {/* Speler filter */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <select
                className="form-input"
                value={filterSpeler}
                onChange={e => setFilterSpeler(e.target.value)}
                style={{ width: 'auto', minWidth: '160px', fontSize: '0.875rem', paddingRight: '2rem', appearance: 'none' }}
              >
                <option value="">Alle spelers</option>
                {spelers.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', pointerEvents: 'none', color: 'var(--color-text-secondary)' }} />
            </div>

            {/* Sorteer */}
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginLeft: 'auto' }}>
              <button
                onClick={() => setSorteer('datum')}
                style={{
                  padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-md)',
                  border: sorteer === 'datum' ? 'none' : '1px solid var(--color-border)',
                  background: sorteer === 'datum' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: sorteer === 'datum' ? 'white' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontWeight: sorteer === 'datum' ? '700' : '400',
                }}
              >
                Nieuwste
              </button>
              <button
                onClick={() => setSorteer('score')}
                style={{
                  padding: '6px 14px', fontSize: '0.8rem', borderRadius: 'var(--radius-md)',
                  border: sorteer === 'score' ? 'none' : '1px solid var(--color-border)',
                  background: sorteer === 'score' ? 'var(--color-primary)' : 'var(--color-surface)',
                  color: sorteer === 'score' ? 'white' : 'var(--color-text-secondary)',
                  cursor: 'pointer', fontWeight: sorteer === 'score' ? '700' : '400',
                }}
              >
                Hoogste score
              </button>
            </div>
          </div>
        </div>

        {/* Reviews lijst */}
        {loading ? (
          <div className="animate-pulse" style={{ padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
            Laden...
          </div>
        ) : gefilterd.length === 0 ? (
          <div className="card" style={{ padding: 'var(--spacing-2xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            Geen reviews gevonden.
          </div>
        ) : (
          <div className="card">
            <AnimatePresence>
              {gefilterd.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderBottom: i < gefilterd.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  {/* Bovenste rij: sterren + reviewer + speler + datum */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap', marginBottom: '4px' }}>
                    <StarDisplay score={review.score} />
                    <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                      {review.reviewer_naam || 'Anoniem'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>over</span>
                    <span
                      onClick={() => navigate(`/spelers/${review.speler_naam.toLowerCase()}`)}
                      style={{
                        fontSize: '0.85rem', fontWeight: '700',
                        color: 'var(--color-primary)', cursor: 'pointer',
                        textDecoration: 'underline', textDecorationColor: 'transparent',
                        transition: 'text-decoration-color 0.2s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--color-primary)')}
                      onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
                    >
                      {review.speler_naam}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                      {new Date(review.created_at).toLocaleDateString('nl-BE', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  </div>

                  {/* Commentaar */}
                  {review.commentaar && (
                    <p style={{
                      margin: '4px 0 0',
                      fontSize: '0.875rem',
                      color: 'var(--color-text-secondary)',
                      fontStyle: 'italic',
                      lineHeight: 1.5,
                    }}>
                      "{review.commentaar}"
                    </p>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

      </motion.div>
    </div>
  );
};
