import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { COPY } from '../../lib/copy';
import { AggregatedStats } from '../../lib/types';

// DIT VERTELT TYPESCRIPT DAT 'STATS' BINNENKOMEN:
interface TopScorerTableProps {
  stats: AggregatedStats[];
}

export const TopScorerTable = ({ stats }: TopScorerTableProps) => {
  const navigate = useNavigate();

  // We filteren spelers met goals en sorteren ze van hoog naar laag
  const topScorers = [...stats]
    .filter(s => s.doelpunten > 0)
    .sort((a, b) => b.doelpunten - a.doelpunten)
    .slice(0, 5); // We tonen de top 5 op de homepage

  if (topScorers.length === 0) return null;

  return (
    <div className="card" style={{ marginTop: 'var(--spacing-2xl)' }}>
      <div className="card-header">
        <h3 className="card-title">
          <Trophy size={24} /> {COPY.HOME_TOP_SCORERS_TITLE}
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
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}
            </div>
            <div
              className="topscorer-name"
              onClick={() => navigate(`/spelers/${scorer.speler_naam.toLowerCase()}`)}
              style={{
                cursor: 'pointer',
                textDecoration: 'underline',
                textDecorationColor: 'transparent',
                transition: 'text-decoration-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'currentColor')}
              onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
            >
              {scorer.speler_naam}
            </div>
            <div className="topscorer-goals">
              <span style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>{scorer.doelpunten}</span>
              <span style={{ fontSize: '0.8rem', opacity: 0.7, marginLeft: '4px' }}>goals</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
