import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useStats } from '../../hooks/useStats';
import { COPY } from '../../lib/copy';

export const TopScorerTable = () => {
  const { stats, loading } = useStats();
  
  if (loading) {
    return (
      <div className="card animate-pulse" style={{ minHeight: '200px' }}>
        <p style={{ color: 'var(--color-text-secondary)' }}>{COPY.LOADING_STATS}</p>
      </div>
    );
  }
  
  // Top 5 scorers
  const topScorers = stats
    .filter(s => s.doelpunten > 0)
    .sort((a, b) => b.doelpunten - a.doelpunten)
    .slice(0, 5);
  
  if (topScorers.length === 0) {
    return null;
  }
  
  return (
    <div className="card" style={{ marginTop: 'var(--spacing-2xl)' }}>
      <div className="card-header">
        <h3 className="card-title">
          <Trophy size={24} />
          {COPY.HOME_TOP_SCORERS_TITLE}
        </h3>
      </div>
      
      <div className="topscorer-table">
        {topScorers.map((scorer, index) => (
          <motion.div
            key={scorer.speler_naam}
            className="topscorer-row"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="topscorer-rank">
              {index === 0 && '🥇'}
              {index === 1 && '🥈'}
              {index === 2 && '🥉'}
              {index > 2 && `${index + 1}.`}
            </div>
            <div className="topscorer-name">{scorer.speler_naam}</div>
            <div className="topscorer-goals">{scorer.doelpunten}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
