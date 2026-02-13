import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award } from 'lucide-react';
import { useStats } from '../../hooks/useStats';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return { icon: <Trophy size={14} />, className: 'rank-1' };
  if (rank === 2) return { icon: <Award size={14} />, className: 'rank-2' };
  if (rank === 3) return { icon: <Award size={14} />, className: 'rank-3' };
  return { icon: rank, className: '' };
};

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string) => {
  const colors = [
    'linear-gradient(135deg, #dc2626, #7c2d12)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    'linear-gradient(135deg, #ec4899, #db2777)',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const StatsTable = () => {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Statistieken laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <p style={{ color: 'var(--color-error)' }}>Fout bij laden: {error}</p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-xl)', textAlign: 'center' }}>
        <Trophy size={48} style={{ color: 'var(--color-text-tertiary)', margin: '0 auto var(--spacing-md)' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Nog geen statistieken beschikbaar</p>
      </div>
    );
  }

  const maxAanwezig = Math.max(...stats.map(s => s.aanwezig));
  const maxDoelpunten = Math.max(...stats.map(s => s.doelpunten));

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">🏆 Speler Rankings</h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {stats.length} spelers
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
      >
        <table className="stats-table">
          <thead>
            <tr>
              <th style={{ width: '50px' }}>#</th>
              <th>Speler</th>
              <th>Aanwezig</th>
              <th>Doelpunten</th>
              <th>Corners</th>
              <th>Penalties</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, index) => {
              const rank = index + 1;
              const rankBadge = getRankBadge(rank);
              const aanwezigPercentage = maxAanwezig > 0 ? (stat.aanwezig / maxAanwezig) * 100 : 0;
              const doelpuntenPercentage = maxDoelpunten > 0 ? (stat.doelpunten / maxDoelpunten) * 100 : 0;
              const cornerPercentage = stat.doelpunten > 0 ? (stat.corner / stat.doelpunten) * 100 : 0;

              return (
                <motion.tr key={stat.speler_naam} variants={item}>
                  <td>
                    <div className={`rank-badge ${rankBadge.className}`}>
                      {rankBadge.icon}
                    </div>
                  </td>
                  <td>
                    <div className="player-cell">
                      <div
                        className="player-avatar"
                        style={{ background: getAvatarColor(stat.speler_naam) }}
                      >
                        {getInitials(stat.speler_naam)}
                      </div>
                      <div className="player-info">
                        <div className="player-name">
                          {stat.speler_naam}
                          {rank === 1 && (
                            <span style={{ fontSize: '1.25rem' }}>🔥</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="stat-bar-container">
                      <div className="stat-bar-wrapper">
                        <motion.div
                          className="stat-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${aanwezigPercentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                        />
                      </div>
                      <div className="stat-value">
                        <TrendingUp size={14} color="var(--color-success)" />
                        {stat.aanwezig}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="stat-bar-container">
                      <div className="stat-bar-wrapper">
                        <motion.div
                          className="stat-bar"
                          initial={{ width: 0 }}
                          animate={{ width: `${doelpuntenPercentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                        />
                      </div>
                      <div className="stat-value">
                        <Trophy size={14} color="var(--color-primary)" />
                        {stat.doelpunten}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="stat-bar-container">
                      <div className="stat-bar-wrapper">
                        <motion.div
                          className="stat-bar"
                          style={{ background: 'linear-gradient(90deg, #7c2d12, #dc2626)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${cornerPercentage}%` }}
                          transition={{ duration: 0.8, delay: index * 0.05 }}
                        />
                      </div>
                      <div className="stat-value">{stat.corner}</div>
                    </div>
                  </td>
                  <td>
                    <div className="stat-number">{stat.penalty}</div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </div>
  );
};
