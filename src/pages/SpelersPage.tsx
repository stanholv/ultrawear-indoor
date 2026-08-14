import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, ChevronRight } from 'lucide-react';
import { useProfiles } from '../hooks/useProfiles';
import { useStats } from '../hooks/useStats';
import { useSpelers } from '../hooks/useSpelers';

export const SpelersPage = () => {
  const navigate = useNavigate();
  const { profiles, loading: profilesLoading } = useProfiles();
  const { stats, loading: statsLoading } = useStats();
  const { actieveNamen, loading: spelersLoading } = useSpelers();

  const loading = profilesLoading || statsLoading || spelersLoading;

  // Toon de actieve selectie plus iedereen die dit seizoen stats heeft.
  const namen = Array.from(new Set([...actieveNamen, ...stats.map(s => s.speler_naam)])).sort();

  const spelers = namen.map((naam: string) => {
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
    <div className="container" style={{ padding: 'var(--spacing-xl) var(--spacing-xl) var(--spacing-2xl)' }}>
      <div className="page-header">
        <h1 className="page-title">Selectie</h1>
        <p className="page-subtitle">{spelers.length} spelers · klik voor het profiel</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--spacing-md)' }}>
        {spelers.map(({ naam, profile, stat }: { naam: string; profile: any; stat: any }, index: number) => (
          <motion.div
            key={naam}
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02 }}
            onClick={() => navigate(`/spelers/${naam.toLowerCase()}`)}
            whileHover={{ y: -2 } as any}
            whileTap={{ scale: 0.98 }}
            style={{
              cursor: 'pointer',
              padding: 'var(--spacing-md)',
              minHeight: 128,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 'var(--spacing-md)',
            }}
          >
            {/* Rugnummer + positie */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span className="shirt-number" style={{
                fontSize: '2.75rem',
                color: profile?.rugnummer ? 'var(--color-primary)' : 'var(--color-border)',
              }}>
                {profile?.rugnummer ?? '–'}
              </span>
            </div>

            {/* Naam + stats */}
            <div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase',
                fontSize: '1.35rem', lineHeight: 1, letterSpacing: '0.01em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {naam}
              </div>
              <div style={{
                display: 'flex', gap: 'var(--spacing-md)', marginTop: '6px',
                fontFamily: 'var(--font-cond)', textTransform: 'uppercase', letterSpacing: '0.05em',
                fontSize: '0.72rem', color: 'var(--color-text-secondary)',
              }}>
                {stat ? (
                  <>
                    <span><strong style={{ color: 'var(--color-text-primary)' }}>{stat.doelpunten}</strong> goals</span>
                    <span><strong style={{ color: 'var(--color-text-primary)' }}>{stat.aanwezig}</strong> matchen</span>
                  </>
                ) : (
                  <span style={{ color: 'var(--color-text-tertiary)' }}>Nog geen stats</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
