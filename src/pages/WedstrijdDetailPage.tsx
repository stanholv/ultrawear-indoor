import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
// @ts-ignore - lucide-react 0.263 mist enkele type-exports
import { ArrowLeft, Calendar, Users, Target, TrendingUp, TrendingDown, Minus, Flag, Crosshair, Share } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';
import { scoreVan } from '../lib/types';
import { generateMatchCard, shareImage } from '../lib/shareCard';
interface SpelerStat {
  id: string;
  speler_naam: string;
  aanwezig: boolean;
  doelpunten: number;
  penalty: number;
  corner: number;
}

interface Wedstrijd {
  id: string;
  datum: string;
  tijd: string;
  thuisploeg: string;
  uitploeg: string;
  uitslag: string;
  type: 'competitie' | 'beker' | 'oefenwedstrijd';
  forfait?: boolean;
  owngoals?: number;
  opmerkingen?: string;
}

export const WedstrijdDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wedstrijd, setWedstrijd] = useState<Wedstrijd | null>(null);
  const [stats, setStats] = useState<SpelerStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);

      const [wedstrijdRes, statsRes] = await Promise.all([
        supabase.from('wedstrijden').select('*').eq('id', id).single(),
        supabase.from('speler_stats').select('*').eq('wedstrijd_id', id),
      ]);

      if (wedstrijdRes.data) setWedstrijd(wedstrijdRes.data);
      if (statsRes.data) setStats(statsRes.data);

      setLoading(false);
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="animate-pulse">Laden...</div>
      </div>
    );
  }

  if (!wedstrijd) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <p>Wedstrijd niet gevonden.</p>
        <button className="btn btn-primary" onClick={() => navigate('/uitslagen')} style={{ marginTop: 'var(--spacing-lg)' }}>
          <ArrowLeft size={18} /> Terug
        </button>
      </div>
    );
  }

  const aanwezigen = stats
    .filter(s => s.aanwezig)
    .sort((a, b) => b.doelpunten - a.doelpunten);

  const isThuis = wedstrijd.thuisploeg === 'Ultrawear Indoor';
  const tegenstander = isThuis ? wedstrijd.uitploeg : wedstrijd.thuisploeg;
  const detailScore = scoreVan(wedstrijd) ?? { thuis: 0, uit: 0 };
  const scoreThuis = detailScore.thuis;
  const scoreUit = detailScore.uit;
  const ultraGoals = isThuis ? scoreThuis : scoreUit;
  const tegenGoals = isThuis ? scoreUit : scoreThuis;

  const resultaat = ultraGoals > tegenGoals ? 'W' : ultraGoals === tegenGoals ? 'D' : 'L';
  const resultaatKleur = resultaat === 'W' ? 'var(--color-success)' : resultaat === 'D' ? '#f59e0b' : '#ef4444';
  const ResultaatIcon = resultaat === 'W' ? TrendingUp : resultaat === 'D' ? Minus : TrendingDown;

  const totalDoelpunten = aanwezigen.reduce((s, p) => s + (p.doelpunten || 0), 0);
  const totalCorners = aanwezigen.reduce((s, p) => s + (p.corner || 0), 0);
  const totalPenalties = aanwezigen.reduce((s, p) => s + (p.penalty || 0), 0);

  const handleShare = async () => {
    if (!wedstrijd) return;
    try {
      const datumStr = new Date(wedstrijd.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric' });
      const scorers = aanwezigen.filter(s => s.doelpunten > 0).map(s => `${s.speler_naam} ${s.doelpunten}`);
      const blob = await generateMatchCard({
        isThuis, opponent: tegenstander, ultra: ultraGoals, tegen: tegenGoals,
        res: resultaat as 'W' | 'D' | 'L', datum: datumStr, scorers,
      });
      const r = await shareImage(blob, `ultrawear-${wedstrijd.datum}.png`,
        `Ultrawear Indoor ${ultraGoals}-${tegenGoals} ${isThuis ? 'vs' : '@'} ${tegenstander}`);
      if (r === 'downloaded') toast.success('Afbeelding gedownload 📸');
      else if (r === 'shared') toast.success('Gedeeld! 🎉');
    } catch {
      toast.error('Kon de afbeelding niet maken');
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Terug + Deel */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
          <button
            onClick={() => navigate('/uitslagen')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-sm)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-secondary)',
              fontWeight: '600',
              fontSize: '0.875rem',
              padding: 0,
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
          >
            <ArrowLeft size={18} /> Terug naar uitslagen
          </button>

          <button
            onClick={handleShare}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'var(--color-primary)', color: 'white', border: 'none',
              borderRadius: 'var(--radius-md)', padding: '8px 16px',
              fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Share size={16} /> Deel
          </button>
        </div>

        {/* Match Header — scoreboard uit het matchprogramma */}
        <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-secondary)', color: '#fff', marginBottom: 'var(--spacing-xl)' }}>
          <div className="stripe-accent" />
          <div style={{ padding: 'var(--spacing-lg)' }}>
            {/* Meta: type · locatie · datum */}
            <div className="kicker" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 'var(--spacing-md)' }}>
              {wedstrijd.type === 'beker' ? 'Beker' : wedstrijd.type === 'oefenwedstrijd' ? 'Oefenwedstrijd' : 'Competitie'}
              {' · '}{isThuis ? 'Thuis' : 'Uit'}
              {' · '}{new Date(wedstrijd.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>

            {/* Scoreboard: twee ploegen, grote scores */}
            <div>
              {([
                { naam: wedstrijd.thuisploeg, s: scoreThuis, won: scoreThuis > scoreUit },
                { naam: wedstrijd.uitploeg, s: scoreUit, won: scoreUit > scoreThuis },
              ]).map((row) => {
                const isUs = row.naam === 'Ultrawear Indoor';
                const dim = !row.won && scoreThuis !== scoreUit;
                return (
                  <div key={row.naam} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', padding: '2px 0', opacity: dim ? 0.5 : 1 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase',
                      fontSize: 'clamp(1.4rem, 6vw, 2.1rem)', lineHeight: 1, letterSpacing: '0.01em',
                      color: isUs ? 'var(--color-primary-light)' : '#fff',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {isUs ? 'Ultrawear' : row.naam}
                    </span>
                    <span className="scoreline" style={{ fontSize: 'clamp(2.4rem, 12vw, 3.75rem)', color: '#fff', flexShrink: 0 }}>{row.s}</span>
                  </div>
                );
              })}
            </div>

            {/* Resultaat */}
            <div style={{ marginTop: 'var(--spacing-sm)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span className="kicker" style={{ color: 'rgba(255,255,255,0.5)' }}>Eindstand</span>
              <span style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '0.8rem', color: resultaatKleur }}>
                {resultaat === 'W' ? 'Gewonnen' : resultaat === 'L' ? 'Verloren' : 'Gelijkspel'}
              </span>
            </div>

            {wedstrijd.opmerkingen && (
              <div style={{ marginTop: 'var(--spacing-md)', fontFamily: 'var(--font-cond)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                {wedstrijd.opmerkingen}
              </div>
            )}
          </div>
        </div>

        {/* Snelle totalen */}
        <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Aanwezigen</div>
                <div className="stat-value">{aanwezigen.length}</div>
                <div className="stat-detail">van {stats.length} spelers</div>
              </div>
              <div className="stat-icon"><Users size={24} /></div>
            </div>
          </motion.div>

          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Doelpunten</div>
                <div className="stat-value">{totalDoelpunten}{(wedstrijd.owngoals ?? 0) > 0 ? ` + ${wedstrijd.owngoals}` : ''}</div>
                <div className="stat-detail">
                  {(wedstrijd.owngoals ?? 0) > 0
                    ? `${totalDoelpunten} door spelers + ${wedstrijd.owngoals} owngoal${wedstrijd.owngoals === 1 ? '' : 's'} = ${totalDoelpunten + (wedstrijd.owngoals ?? 0)}`
                    : 'door spelers geregistreerd'}
                </div>
              </div>
              <div className="stat-icon"><Target size={24} /></div>
            </div>
          </motion.div>

          <motion.div className="stat-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Corners / Penalties</div>
                <div className="stat-value" style={{ fontSize: '1.75rem' }}>{totalCorners} / {totalPenalties}</div>
                <div className="stat-detail">corners · penalties</div>
              </div>
              <div className="stat-icon"><Flag size={24} /></div>
            </div>
          </motion.div>
        </div>

        {/* Spelersstatistieken */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Users size={24} /> Spelersstatistieken
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {aanwezigen.length} aanwezigen
            </div>
          </div>

          {aanwezigen.length === 0 ? (
            <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              Geen spelersstatistieken beschikbaar voor deze wedstrijd.
            </div>
          ) : (
            <div className="rankings-container">
              <table className="rankings-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px' }}>#</th>
                    <th>Speler</th>
                    <th style={{ textAlign: 'center', width: '90px' }}>
                      <span title="Doelpunten">⚽ Goals</span>
                    </th>
                    <th style={{ textAlign: 'center', width: '90px' }}>
                      <span title="Corners">🚩 Corners</span>
                    </th>
                    <th style={{ textAlign: 'center', width: '90px' }}>
                      <span title="Penalties">🎯 Penalties</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {aanwezigen.map((speler, index) => (
                    <motion.tr
                      key={speler.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td data-label="#">
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: 'var(--color-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '0.875rem',
                          color: 'var(--color-text-secondary)',
                        }}>
                          {index + 1}
                        </div>
                      </td>
                      <td data-label="Speler">
                        <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                          {speler.speler_naam}
                          {speler.doelpunten > 0 && index === 0 && <span>🔥</span>}
                        </div>
                      </td>
                      <td data-label="Goals" style={{ textAlign: 'center' }}>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '1.125rem',
                          color: speler.doelpunten > 0 ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
                        }}>
                          {speler.doelpunten || 0}
                        </div>
                      </td>
                      <td data-label="Corners" style={{ textAlign: 'center' }}>
                        <div style={{
                          fontWeight: '600',
                          color: speler.corner > 0 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        }}>
                          {speler.corner || 0}
                        </div>
                      </td>
                      <td data-label="Penalties" style={{ textAlign: 'center' }}>
                        <div style={{
                          fontWeight: '600',
                          color: speler.penalty > 0 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                        }}>
                          {speler.penalty || 0}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
