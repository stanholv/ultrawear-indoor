import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, Edit2, Check, X, Shield, Target, Flag, Calendar, TrendingUp, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useProfiles, useReviews, useUpdateProfile } from '../hooks/useProfiles';
import { useStats, useSpelerForm } from '../hooks/useStats';
import { useAuth } from '../hooks/useAuth';

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

// Form indicator: laatste 5 wedstrijden als bolletjes
const FormIndicator = ({ form }: { form: { doelpunten: number; tegenstander: string }[] }) => {
  if (form.length === 0) return null;
  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      <div className="card">
        <div className="card-header" style={{ marginBottom: 'var(--spacing-sm)' }}>
          <h3 className="card-title" style={{ fontSize: '1rem' }}>
            <TrendingUp size={18} /> Vorm (laatste {form.length} wedstrijden)
          </h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', padding: 'var(--spacing-sm) 0', overflowX: 'auto' }}>
          {[...form].reverse().map((w, i) => {
            const hoogte = Math.max(24, (w.doelpunten + 1) * 20);
            // Tegenstander naam afkappen op mobile
            const kortNaam = w.tegenstander.length > 8 ? w.tegenstander.slice(0, 8) + '…' : w.tegenstander;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', flex: '1 0 52px', minWidth: '52px' }}>
                <div style={{
                  fontSize: '0.75rem', fontWeight: '700',
                  color: w.doelpunten > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                }}>
                  {w.doelpunten > 0 ? `${w.doelpunten}⚽` : '—'}
                </div>
                <div style={{
                  width: '100%', maxWidth: '44px',
                  height: `${hoogte}px`,
                  background: w.doelpunten > 0 ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'height 0.3s ease',
                  minHeight: '12px',
                }} />
                <div style={{ fontSize: '0.6rem', color: 'var(--color-text-tertiary)', textAlign: 'center', wordBreak: 'break-word', lineHeight: 1.2 }}>
                  {kortNaam}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Beste seizoen prestatie
const BestePrestatie = ({ stats, spelerNaam }: { stats: any[]; spelerNaam: string }) => {
  const spelerStat = stats.find(s => s.speler_naam === spelerNaam);
  if (!spelerStat || spelerStat.aanwezig === 0) return null;

  const aanwezigPct = Math.round((spelerStat.aanwezig / Math.max(...stats.map((s: any) => s.aanwezig))) * 100);
  const isTopscorer = stats.every((s: any) => spelerStat.doelpunten >= s.doelpunten);
  const isPresentieleider = stats.every((s: any) => spelerStat.aanwezig >= s.aanwezig);
  const goalsPerWedstrijd = spelerStat.aanwezig > 0 ? (spelerStat.doelpunten / spelerStat.aanwezig).toFixed(2) : '0';

  const prestaties = [];
  if (isTopscorer && spelerStat.doelpunten > 0) prestaties.push({ icon: '🥇', label: 'Topscorer van het seizoen' });
  if (isPresentieleider) prestaties.push({ icon: '🏆', label: 'Meeste wedstrijden gespeeld' });
  if (spelerStat.doelpunten > 0) prestaties.push({ icon: '⚽', label: `${goalsPerWedstrijd} goals per wedstrijd` });

  return (
    <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
      <div className="card-header" style={{ marginBottom: 'var(--spacing-sm)' }}>
        <h3 className="card-title" style={{ fontSize: '1rem' }}>
          <Award size={18} /> Seizoen Hoogtepunten
        </h3>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)', padding: 'var(--spacing-sm) 0' }}>
        {prestaties.map((p, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
            background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-sm) var(--spacing-md)',
            fontSize: '0.875rem', fontWeight: '600',
            border: '1px solid var(--color-border)',
          }}>
            <span style={{ fontSize: '1.1rem' }}>{p.icon}</span>
            {p.label}
          </div>
        ))}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
          background: 'var(--color-surface)', borderRadius: 'var(--radius-md)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          fontSize: '0.875rem', fontWeight: '600',
          border: '1px solid var(--color-border)',
        }}>
          <span style={{ fontSize: '1.1rem' }}>📅</span>
          {aanwezigPct}% aanwezigheid
        </div>
      </div>
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

  const spelerNaam = naam ? naam.charAt(0).toUpperCase() + naam.slice(1) : '';

  const profile = profiles.find((p: any) => p.speler_naam?.toLowerCase() === naam);
  const stat = stats.find((s: any) => s.speler_naam === spelerNaam);

  const isEigenProfiel = authProfile?.speler_naam?.toLowerCase() === naam;
  const isAdmin = authProfile?.role === 'admin';
  const kanBewerken = isEigenProfiel || isAdmin;

  const { reviews, gemiddelde, addReview } = useReviews(spelerNaam);
  const { form } = useSpelerForm(spelerNaam);

  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState(profile?.bio || '');
  const [editRugnummer, setEditRugnummer] = useState(profile?.rugnummer?.toString() || '');
  const [saving, setSaving] = useState(false);

  const [reviewScore, setReviewScore] = useState(0);
  const [reviewCommentaar, setReviewCommentaar] = useState('');
  const [reviewNaam, setReviewNaam] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditBio(profile.bio || '');
      setEditRugnummer(profile.rugnummer?.toString() || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile?.id) return;
    setSaving(true);
    const { success, error } = await updateProfile(profile.id, {
      bio: editBio,
      rugnummer: editRugnummer ? parseInt(editRugnummer) : undefined,
    });
    setSaving(false);
    if (success) {
      toast.success('Profiel opgeslagen!');
      setEditing(false);
      await refreshProfile();
    } else {
      toast.error(error || 'Fout bij opslaan');
    }
  };

  const handleReviewSubmit = async () => {
    if (reviewScore === 0) { toast.error('Geef een score van 1 tot 5 sterren'); return; }
    if (!reviewNaam.trim()) { toast.error('Vul je naam in'); return; }
    setReviewLoading(true);
    const { success, error } = await addReview(reviewScore, reviewCommentaar, reviewNaam);
    setReviewLoading(false);
    if (success) {
      toast.success('Review toegevoegd! ⭐');
      setReviewScore(0); setReviewCommentaar(''); setReviewNaam(''); setReviewOpen(false);
    } else {
      toast.error(error || 'Fout bij toevoegen review');
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <style>{`
        @media (min-width: 640px) {
          .speler-stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
        }
      `}</style>
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
        <div className="card card-hero" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            <div>
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

              {gemiddelde > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginTop: 'var(--spacing-sm)' }}>
                  <StarRating value={Math.round(gemiddelde)} readonly />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                    {gemiddelde} / 5 ({reviews.length} reviews)
                  </span>
                </div>
              )}
            </div>

            {kanBewerken && !editing && (
              <button
                onClick={() => setEditing(true)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  border: '2px solid rgba(255,255,255,0.6)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem',
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
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label className="form-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Rugnummer</label>
                <input
                  type="number"
                  className="form-input"
                  value={editRugnummer}
                  onChange={e => setEditRugnummer(e.target.value)}
                  placeholder="bijv. 9"
                  min="1" max="99"
                  style={{ maxWidth: '120px' }}
                />
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
                <button onClick={handleSave} disabled={saving} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                  background: 'white', color: 'var(--color-primary)',
                  border: 'none', borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  cursor: 'pointer', fontWeight: '700',
                }}>
                  <Check size={16} /> {saving ? 'Opslaan...' : 'Opslaan'}
                </button>
                <button onClick={() => setEditing(false)} style={{
                  display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                  background: 'rgba(255,255,255,0.15)', color: 'white',
                  border: '1px solid rgba(255,255,255,0.4)', borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-sm) var(--spacing-lg)',
                  cursor: 'pointer', fontWeight: '600',
                }}>
                  <X size={16} /> Annuleren
                </button>
              </div>
            </motion.div>
          )}

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
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-lg)',
          }}
          className="speler-stats-grid"
          >
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

        {/* Form indicator */}
        <FormIndicator form={form} />

        {/* Beste seizoen prestatie */}
        {stat && <BestePrestatie stats={stats} spelerNaam={spelerNaam} />}

        {/* Reviews sectie */}
        <div className="card" style={{ marginTop: 'var(--spacing-lg)' }}>
          <div className="card-header" style={{ flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
            <h2 className="card-title" style={{ flex: '1 1 auto' }}>
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
              style={{ fontSize: '0.875rem', flexShrink: 0 }}
            >
              {reviewOpen ? 'Annuleren' : '+ Review schrijven'}
            </button>
          </div>

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
              <button onClick={handleReviewSubmit} disabled={reviewLoading || reviewScore === 0} className="btn btn-primary">
                {reviewLoading ? 'Opslaan...' : 'Review Opslaan'}
              </button>
            </motion.div>
          )}

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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      <StarRating value={review.score} readonly />
                      <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>{review.reviewer_naam || 'Anoniem'}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                      {new Date(review.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {review.commentaar && (
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)', paddingLeft: '4px' }}>
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
