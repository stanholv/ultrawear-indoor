import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, Target, TrendingUp, TrendingDown, Minus, Flag, Crosshair } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
  const [scoreThuis, scoreUit] = wedstrijd.uitslag.split('-').map(Number);
  const ultraGoals = isThuis ? scoreThuis : scoreUit;
  const tegenGoals = isThuis ? scoreUit : scoreThuis;

  const resultaat = ultraGoals > tegenGoals ? 'W' : ultraGoals === tegenGoals ? 'D' : 'L';
  const resultaatKleur = resultaat === 'W' ? 'var(--color-success)' : resultaat === 'D' ? '#f59e0b' : '#ef4444';
  const ResultaatIcon = resultaat === 'W' ? TrendingUp : resultaat === 'D' ? Minus : TrendingDown;

  const totalDoelpunten = aanwezigen.reduce((s, p) => s + (p.doelpunten || 0), 0);
  const totalCorners = aanwezigen.reduce((s, p) => s + (p.corner || 0), 0);
  const totalPenalties = aanwezigen.reduce((s, p) => s + (p.penalty || 0), 0);

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        {/* Terug knop */}
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
            marginBottom: 'var(--spacing-lg)',
            padding: 0,
            transition: 'color var(--transition-fast)',
          }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-primary)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
        >
          <ArrowLeft size={18} /> Terug naar uitslagen
        </button>

        {/* Match Header Card */}
        <div className="card card-hero" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 'var(--spacing-md)' }}>
            {/* Wedstrijd info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
                <span
                  className="badge"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    fontSize: '0.75rem',
                  }}
                >
                  {wedstrijd.type === 'beker' ? '🏆 Beker' : wedstrijd.type === 'oefenwedstrijd' ? '⚽ Oefenwedstrijd' : '🥇 Competitie'}
                </span>
                <span
                  className="badge"
                  style={{ background: 'rgba(255,255,255,0.2)', fontSize: '0.75rem' }}
                >
                  {isThuis ? '🏠 Thuis' : '✈️ Uit'}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 2rem)', fontWeight: '800', color: 'white', margin: 0 }}>
                Ultrawear Indoor {isThuis ? 'vs' : '@'} {tegenstander}
              </h1>
              <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', marginTop: 'var(--spacing-sm)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                <Calendar size={14} />
                {new Date(wedstrijd.datum).toLocaleDateString('nl-BE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • {wedstrijd.tijd}
              </div>
            </div>

            {/* Score + Resultaat */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: resultaatKleur + '30',
                  border: `2px solid ${resultaatKleur}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                }}
              >
                {resultaat}
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)', fontWeight: '800', color: 'white', lineHeight: 1 }}>
                  {ultraGoals} – {tegenGoals}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>eindstand</div>
              </div>
            </div>
          </div>

          {wedstrijd.opmerkingen && (
            <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'rgba(255,255,255,0.85)' }}>
              📝 {wedstrijd.opmerkingen}
            </div>
          )}
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
                <div className="stat-value">{totalDoelpunten}</div>
                <div className="stat-detail">door spelers geregistreerd</div>
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
