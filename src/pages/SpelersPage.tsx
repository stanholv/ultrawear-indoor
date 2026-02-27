import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { useProfiles } from '../hooks/useProfiles';
import { useStats } from '../hooks/useStats';
import { SPELERS } from '../lib/types';

const POSITIE_KLEUREN: Record<string, string> = {
  'Keeper': '#f59e0b',
  'Verdediger': '#3b82f6',
  'Middenvelder': '#10b981',
  'Aanvaller': '#C8102E',
};

export const SpelersPage = () => {
  const navigate = useNavigate();
  const { profiles, loading: profilesLoading } = useProfiles();
  const { stats, loading: statsLoading } = useStats();

  const loading = profilesLoading || statsLoading;

  // Merge SPELERS array met profiles data, gesorteerd op alfabet
  const spelers = [...SPELERS].sort().map((naam: string) => {
    const profile = profiles.find((p: any) => p.speler_naam === naam);
    const stat = stats.find((s: any) => s.speler_naam === naam);
    return { naam, profile, stat };
  });

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="animate-pulse">Laden...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="hero">
        <div className="hero-content">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="hero-title">
              <Users size={32} style={{ display: 'inline', marginRight: '12px' }} />
              Onze <span style={{ color: 'var(--color-primary)' }}>Spelers</span>
            </h1>
            <p className="hero-subtitle">Klik op een speler voor het volledige profiel</p>
          </motion.div>
        </div>
      </div>

      <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {spelers.map(({ naam, profile, stat }: { naam: string; profile: any; stat: any }, index: number) => (
            <motion.div
              key={naam}
              className="card"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => navigate(`/spelers/${naam.toLowerCase()}`)}
              style={{
                cursor: 'pointer',
                borderLeft: profile?.positie
                  ? `4px solid ${POSITIE_KLEUREN[profile.positie] || 'var(--color-primary)'}`
                  : '4px solid var(--color-border)',
                transition: 'all var(--transition-fast)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                marginBottom: 0,
              }}
              whileHover={{ x: 4, borderLeftColor: 'var(--color-primary)' } as any}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flex: 1, flexWrap: 'wrap' }}>
                  {/* Naam + rugnummer */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', minWidth: '120px' }}>
                    {profile?.rugnummer && (
                      <span style={{
                        background: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: 'var(--radius-sm)',
                        padding: '2px 8px',
                        fontSize: '0.75rem',
                        fontWeight: '800',
                      }}>
                        #{profile.rugnummer}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>{naam}</h3>
                  </div>

                  {/* Positie */}
                  {profile?.positie && (
                    <div style={{
                      display: 'inline-block',
                      background: (POSITIE_KLEUREN[profile.positie] || 'var(--color-primary)') + '20',
                      color: POSITIE_KLEUREN[profile.positie] || 'var(--color-primary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '2px 8px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      marginBottom: 'var(--spacing-sm)',
                    }}>
                      {profile.positie}
                    </div>
                  )}

                  {/* Stats samenvatting */}
                  {stat && (
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <span>⚽ {stat.doelpunten} goals</span>
                      <span>📅 {stat.aanwezig} wed.</span>
                    </div>
                  )}

                  {/* Geen profiel */}
                  {!profile && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      Nog geen profiel
                    </div>
                  )}
                </div>

                <ChevronRight size={20} color="var(--color-text-tertiary)" style={{ flexShrink: 0, marginTop: '4px' }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
