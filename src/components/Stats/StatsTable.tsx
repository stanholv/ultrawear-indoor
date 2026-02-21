import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { COPY } from '../../lib/copy';
import { AggregatedStats } from '../../lib/types';

interface StatsTableProps {
  stats: AggregatedStats[];
}

const getRankBadge = (rank: number) => {
  if (rank === 1) return { icon: '🥇', className: 'rank-1' };
  if (rank === 2) return { icon: '🥈', className: 'rank-2' };
  if (rank === 3) return { icon: '🥉', className: 'rank-3' };
  return { icon: `${rank}.`, className: '' };
};

export const StatsTable = ({ stats }: StatsTableProps) => {
  const sortedStats = [...stats].sort((a, b) => b.doelpunten - a.doelpunten);

  const maxAanwezig = Math.max(...stats.map(s => s.aanwezig), 0);
  const maxDoelpunten = Math.max(...stats.map(s => s.doelpunten), 0);

  return (
    <div className="card" style={{ marginTop: 'var(--spacing-xl)' }}>
      <div className="card-header">
        <h2 className="card-title">
          <Trophy size={24} /> {COPY.STATS_RANKINGS_TITLE}
        </h2>
        <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          {stats.length} {COPY.STATS_PLAYERS_COUNT}
        </div>
      </div>

      <div className="rankings-container">
        <table className="rankings-table">
          <thead>
            <tr>
              {/* Zelfde breedtes als wedstrijd-rijen: compact voor vaste kolommen, flex voor naam */}
              <th style={{ width: '50px' }}>#</th>
              <th>Speler</th>
              <th style={{ textAlign: 'center', width: '100px' }}>Aanwezig</th>
              <th style={{ textAlign: 'center', width: '110px' }}>⚽ Goals</th>
              <th style={{ textAlign: 'center', width: '100px' }}>🚩 Corners</th>
              <th style={{ textAlign: 'center', width: '110px' }}>🎯 Penalties</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat, index) => {
              const rank = index + 1;
              const rankBadge = getRankBadge(rank);
              const aanwezigPercentage = maxAanwezig > 0 ? (stat.aanwezig / maxAanwezig) * 100 : 0;
              const doelpuntenPercentage = maxDoelpunten > 0 ? (stat.doelpunten / maxDoelpunten) * 100 : 0;

              return (
                <motion.tr
                  key={stat.speler_naam}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <td data-label="#">
                    <div className={`rank-badge ${rankBadge.className}`}>
                      {rankBadge.icon}
                    </div>
                  </td>

                  <td data-label="Speler">
                    <div style={{ fontWeight: '600', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                      {stat.speler_naam}
                      {rank === 1 && <span>🔥</span>}
                    </div>
                  </td>

                  <td data-label="Aanwezig" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{ fontWeight: '600' }}>{stat.aanwezig}</div>
                      <div style={{
                        width: '100%',
                        maxWidth: '70px',
                        height: '4px',
                        background: 'var(--color-surface)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${aanwezigPercentage}%`,
                          height: '100%',
                          background: 'var(--color-success)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  </td>

                  <td data-label="Goals" style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <div style={{
                        fontWeight: '700',
                        fontSize: '1.125rem',
                        color: 'var(--color-primary)',
                      }}>
                        {stat.doelpunten}
                      </div>
                      <div style={{
                        width: '100%',
                        maxWidth: '70px',
                        height: '4px',
                        background: 'var(--color-surface)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          width: `${doelpuntenPercentage}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>
                  </td>

                  <td data-label="Corners" style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: stat.corner > 0 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                      {stat.corner}
                    </div>
                  </td>

                  <td data-label="Penalties" style={{ textAlign: 'center' }}>
                    <div style={{ fontWeight: '600', color: stat.penalty > 0 ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }}>
                      {stat.penalty}
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
