import { motion } from 'framer-motion';
import { Trophy, Target, Users } from 'lucide-react';
import { AggregatedStats } from '../../lib/types';

// Deze interface MOET exact overeenkomen met wat StatsPage verstuurt
interface StatsOverviewProps {
  stats: AggregatedStats[];
}

export const StatsOverview = ({ stats }: StatsOverviewProps) => {
  // Berekeningen op basis van de props
  const totalGoals = stats.reduce((sum, s) => sum + s.doelpunten, 0);
  const totalMatches = Math.max(...stats.map(s => s.aanwezig), 0);
  const topScorer = [...stats].sort((a, b) => b.doelpunten - a.doelpunten)[0];

  return (
    <div className="stats-grid">
      <motion.div 
        className="stat-card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="stat-card-header">
          <div>
            <div className="stat-label">Totaal Goals</div>
            <div className="stat-value">{totalGoals}</div>
          </div>
          <div className="stat-icon"><Target size={24} /></div>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
      >
        <div className="stat-card-header">
          <div>
            <div className="stat-label">Topscorer</div>
            <div className="stat-value" style={{ fontSize: '1.25rem' }}>
              {topScorer?.speler_naam || '-'}
            </div>
            <div className="stat-detail">{topScorer?.doelpunten || 0} goals</div>
          </div>
          <div className="stat-icon"><Trophy size={24} /></div>
        </div>
      </motion.div>

      <motion.div 
        className="stat-card" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
      >
        <div className="stat-card-header">
          <div>
            <div className="stat-label">Team Matchen</div>
            <div className="stat-value">{totalMatches}</div>
            <div className="stat-detail">Seizoen totaal</div>
          </div>
          <div className="stat-icon"><Users size={24} /></div>
        </div>
      </motion.div>
    </div>
  );
};