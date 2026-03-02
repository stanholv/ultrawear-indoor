import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { useProfiles } from '../hooks/useProfiles';
import { useStats } from '../hooks/useStats';
import { SPELERS } from '../lib/types';

export const SpelersPage = () => {
  const navigate = useNavigate();
  const { profiles, loading: profilesLoading } = useProfiles();
  const { stats, loading: statsLoading } = useStats();

  const loading = profilesLoading || statsLoading;

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
                borderLeft: '4px solid var(--color-primary)',
                transition: 'all var(--transition-fast)',
                padding: 'var(--spacing-md) var(--spacing-lg)',
                marginBottom: 0,
              }}
              whileHover={{ x: 4 } as any}
              whileTap={{ scale: 0.98 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)', flex: 1, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', minWidth: '120px' }}>
                    {profile?.rugnummer && (
                      <span style={{
                        background: 'var(--color-primary)', color: 'white',
                        borderRadius: 'var(--radius-sm)', padding: '2px 8px',
                        fontSize: '0.75rem', fontWeight: '800',
                      }}>
                        #{profile.rugnummer}
                      </span>
                    )}
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700', margin: 0 }}>{naam}</h3>
                  </div>

                  {stat ? (
                    <div style={{ display: 'flex', gap: 'var(--spacing-md)', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <span>⚽ {stat.doelpunten} goals</span>
                      <span>📅 {stat.aanwezig} wed.</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                      Nog geen statistieken
                    </div>
                  )}
                </div>

                <ChevronRight size={20} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
