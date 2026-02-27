import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Edit2, Check, X, Shield, Target, Flag, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useProfiles, useReviews, useUpdateProfile } from '../hooks/useProfiles';
import { useStats } from '../hooks/useStats';
import { useAuth } from '../hooks/useAuth';
import { POSITIES } from '../lib/types';

const POSITIE_KLEUREN: Record<string, string> = {
  'Keeper': '#f59e0b',
  'Verdediger': '#3b82f6',
  'Middenvelder': '#10b981',
  'Aanvaller': '#C8102E',
};

const StarRating = ({ value, onChange, readonly = false }: {
  value: number;
  onChange?: (v: number) => void;
  readonly?: boolean;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={readonly ? 16 : 28}
          fill={(hover || value) >= i ? '#f59e0b' : 'none'}
          color={(hover || value) >= i ? '#f59e0b' : 'var(--color-text-tertiary)'}
          style={{ cursor: readonly ? 'default' : 'pointer', transition: 'all 0.1s' }}
          onClick={() => !readonly && onChange?.(i)}
          onMouseEnter={() => !readonly && setHover(i)}
          onMouseLeave={() => !readonly && setHover(0)}
        />
      ))}
    </div>
  );
};

export const SpelerProfielPage = () => {
  const { naam } = useParams<{ naam: string }>();
  const navigate = useNavigate();
  const { user, profile: authProfile, refreshProfile } = useAuth();
  const { profiles } = useProfiles();
  const { stats } = useStats();
  const { updateProfile } = useUpdateProfile();

  // Naam uit URL (lowercase) terug naar origineel
  const spelerNaam = naam
    ? naam.charAt(0).toUpperCase() + naam.slice(1)
    : '';

  const profile = profiles.find((p: any) => p.speler_naam?.toLowerCase() === naam);
  const stat = stats.find((s: any) => s.speler_naam === spelerNaam);

  // Is de ingelogde user gekoppeld aan deze speler?
  const isEigenProfiel = authProfile?.speler_naam?.toLowerCase() === naam;
  const isAdmin = authProfile?.role === 'admin';
  const kanBewerken = isEigenProfiel || isAdmin;

  // Reviews
  const { reviews, gemiddelde, addReview } = useReviews(spelerNaam);

  // Bewerkingsmodus
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editPositie, setEditPositie] = useState(profile?.positie || '');
  const [editRugnummer, setEditRugnummer] = useState(profile?.rugnummer?.toString() || '');
  const [saving, setSaving] = useState(false);

  // Review formulier
  const [reviewScore, setReviewScore] = useState(0);
  const [reviewCommentaar, setReviewCommentaar] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNaam, setReviewNaam] = useState('');

  useEffect(() => {
    if (profile) {
      setEditBio(profile.bio || '');
      setEditPositie(profile.positie || '');
      setEditRugnummer(profile.rugnummer?.toString() || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.profile_id) return;
    setSaving(true);
    const { success, error } = await updateProfile(profile.profile_id, {
      bio: editBio,
      positie: editPositie,
      rugnummer: editRugnummer ? parseInt(editRugnummer) : undefined,
    });
    setSaving(false);
    if (success) {
      toast.success('Profiel opgeslagen!');
      setEditing(false);
    } else {
      toast.error(error || 'Fout bij opslaan');
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewScore === 0) {
      toast.error('Geef een score van 1 tot 5 sterren');
      return;
    }
    if (!reviewNaam.trim()) {
      toast.error('Vul je naam in');
      return;
    }
    setReviewLoading(true);
    const { success, error } = await addReview(reviewScore, reviewCommentaar, reviewNaam);
    setReviewLoading(false);
    if (success) {
      toast.success('Review toegevoegd! ⭐');
      setReviewScore(0);
      setReviewCommentaar('');
      setReviewNaam('');
      setReviewOpen(false);
    } else {
      toast.error(error || 'Fout bij toevoegen review');
    }
  };

  const positieKleur = profile?.positie ? POSITIE_KLEUREN[profile.positie] || 'var(--color-primary)' : 'var(--color-primary)';

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Terug knop */}
        <button
          onClick={() => navigate('/spelers')}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-text-secondary)', fontWeight: '600',
            fontSize: '0.875rem', marginBottom: 'var(--spacing-lg)', padding: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={18} /> Terug naar spelers
        </button>

        {/* Profiel Hero */}
        <div className="card card-hero" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div>
              {/* Rugnummer + naam */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
                {!editing && profile?.rugnummer && (
                  <span style={{
                    background: 'rgba(255,255,255,0.2)', color: 'white',
                    borderRadius: 'var(--radius-md)', padding: '4px 12px',
                    fontSize: '1.5rem', fontWeight: '800',
                  }}>
                    #{profile.rugnummer}
                  </span>
                )}
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', fontWeight: '800', color: 'white', margin: 0 }}>
                  {spelerNaam}
                </h1>
              </div>

              {/* Positie badge */}
              {!editing && profile?.positie && (
                <span style={{
                  background: positieKleur + '30', color: 'white',
                  borderRadius: 'var(--radius-sm)', padding: '4px 12px',
                  fontSize: '0.875rem', fontWeight: '600',
                  border: `1px solid ${positieKleur}`,
                }}>
                  {profile.positie}
                </span>
              )}

              {/* Gemiddelde score */}
              {gemiddelde > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                  <StarRating value={Math.round(gemiddelde)} readonly />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                    {gemiddelde} / 5 ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {/* Bewerken knop */}
            {kanBewerken && !editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  backdropFilter: 'blur(4px)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
              >
                <Edit2 size={16} /> Bewerken
              </button>
            )}
          </div>

          {/* Bewerkingsformulier */}
          {editing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ marginTop: 'var(--spacing-lg)', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-lg)' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-md)' }}>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Rugnummer</label>
                  <input
                    type="number"
                    className="form-input"
                    value={editRugnummer}
                    onChange={e => setEditRugnummer(e.target.value)}
                    placeholder="bijv. 9"
                    min="1" max="99"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Positie</label>
                  <select
                    className="form-input"
                    value={editPositie}
                    onChange={e => setEditPositie(e.target.value)}
                  >
                    <option value="">-- Kies positie --</option>
                    {POSITIES.map((p: string) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Bio</label>
                <textarea
                  className="form-input"
                  value={editBio}
                  onChange={e => setEditBio(e.target.value)}
                  placeholder="Vertel iets over jezelf..."
                  rows={3}
                  maxLength={300}
                  style={{ resize: 'vertical' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>{editBio.length}/300</div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
                >
                  <Check size={16} /> {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}
                >
                  <X size={16} /> Annuleren
                </button>
              </div>
            </motion.div>
          )}

          {/* Bio */}
          {!editing && profile?.bio && (
            <p style={{ color: 'rgba(255,255,255,0.85)', marginTop: 'var(--spacing-lg)', fontSize: '1rem', lineHeight: 1.6 }}>
              {profile.bio}
            </p>
          )}

          {!editing && !profile && (
            <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: 'var(--spacing-md)', fontStyle: 'italic' }}>
              Dit profiel is nog niet ingevuld.
            </p>
          )}
        </div>

        {/* Statistieken */}
        {stat && (
          <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
            {[
              { label: 'Wedstrijden', value: stat.aanwezig, icon: <Calendar size={24} />, kleur: '#3b82f6' },
              { label: 'Doelpunten', value: stat.doelpunten, icon: <Target size={24} />, kleur: 'var(--color-primary)' },
              { label: 'Corners', value: stat.corner, icon: <Flag size={24} />, kleur: '#10b981' },
              { label: 'Penalties', value: stat.penalty, icon: <Shield size={24} />, kleur: '#f59e0b' },
            ].map((item, i) => (
              <motion.div key={item.label} className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <div className="stat-card-header">
                  <div>
                    <div className="stat-label">{item.label}</div>
                    <div className="stat-value" style={{ color: item.kleur }}>{item.value}</div>
                  </div>
                  <div className="stat-icon" style={{ color: item.kleur }}>{item.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Reviews sectie */}
        <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div className="card-header">
            <h2 className="card-title">
              <Star size={24} /> Reviews
              {gemiddelde > 0 && (
                <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--color-text-secondary)', marginLeft: 'var(--spacing-sm)' }}>
                  — gemiddeld {gemiddelde} ⭐
                </span>
              )}
            </h2>
            <button
              onClick={() => setReviewOpen(!reviewOpen)}
              className="btn btn-primary"
              style={{ fontSize: '0.875rem' }}
            >
              {reviewOpen ? 'Annuleren' : '+ Review schrijven'}
            </button>
          </div>

          {/* Review formulier */}
          {reviewOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}
            >
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="form-label">Jouw beoordeling *</label>
                <StarRating value={reviewScore} onChange={setReviewScore} />
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="form-label">Jouw naam *</label>
                <input
                  type="text"
                  className="form-input"
                  value={reviewNaam}
                  onChange={e => setReviewNaam(e.target.value)}
                  placeholder="Bijv. Jan"
                  maxLength={50}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="form-label">Commentaar (optioneel)</label>
                <textarea
                  className="form-input"
                  value={reviewCommentaar}
                  onChange={e => setReviewCommentaar(e.target.value)}
                  placeholder="Wat vind je van deze speler?"
                  rows={2}
                  maxLength={200}
                  style={{ resize: 'none' }}
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', textAlign: 'right' }}>{reviewCommentaar.length}/200</div>
              </div>
              <button
                onClick={handleReviewSubmit}
                disabled={reviewLoading || reviewScore === 0}
                className="btn btn-primary"
              >
                {reviewLoading ? 'Opslaan...' : 'Review Opslaan'}
              </button>
            </motion.div>
          )}

          {/* Reviews lijst */}
          {reviews.length === 0 ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Nog geen reviews. Wees de eerste!
            </div>
          ) : (
            <div>
              {reviews.map((review: any, i: number) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-lg)',
                    borderBottom: i < reviews.length - 1 ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <StarRating value={review.score} readonly />
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      {new Date(review.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {review.reviewer_naam || 'Anoniem'}
                  </div>
                  {review.commentaar && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {review.commentaar}
                    </p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
