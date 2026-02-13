import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Medal, Trophy, Target, Zap } from 'lucide-react';
import { useStats } from '../../hooks/useStats';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  trend?: number;
  color: string;
}

const StatCard = ({ icon, title, value, trend, color }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="card"
    style={{ borderLeft: `4px solid ${color}` }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', marginBottom: '4px' }}>
          {title}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text-primary)' }}>
          {value}
        </div>
        {trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
            {trend > 0 ? (
              <TrendingUp size={16} color="#10b981" />
            ) : (
              <TrendingDown size={16} color="#ef4444" />
            )}
            <span style={{ fontSize: '0.875rem', color: trend > 0 ? '#10b981' : '#ef4444' }}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </div>
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: 'var(--radius-md)',
          background: `${color}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
        }}
      >
        {icon}
      </div>
    </div>
  </motion.div>
);

export const StatsOverview = () => {
  const { stats } = useStats();

  const totalGames = stats.reduce((sum, s) => sum + s.aanwezig, 0);
  const totalGoals = stats.reduce((sum, s) => sum + s.doelpunten, 0);
  const totalCorners = stats.reduce((sum, s) => sum + s.corner, 0);
  const totalPenalties = stats.reduce((sum, s) => sum + s.penalty, 0);
  const avgGoalsPerGame = totalGames > 0 ? (totalGoals / totalGames).toFixed(1) : '0';
  const topScorer = stats[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
      <StatCard
        icon={<Trophy size={24} />}
        title="Totaal Wedstrijden"
        value={Math.max(...stats.map(s => s.aanwezig))}
        color="#dc2626"
      />
      <StatCard
        icon={<Target size={24} />}
        title="Totaal Doelpunten"
        value={totalGoals}
        trend={12}
        color="#f59e0b"
      />
      <StatCard
        icon={<Zap size={24} />}
        title="Gem. per Wedstrijd"
        value={avgGoalsPerGame}
        color="#10b981"
      />
      <StatCard
        icon={<Medal size={24} />}
        title="Topscorer"
        value={topScorer?.speler_naam || '-'}
        color="#3b82f6"
      />
    </div>
  );
};
