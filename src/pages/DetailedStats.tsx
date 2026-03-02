import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Award, TrendingUp, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilteredStats } from '../hooks/useStats';
import { supabase } from '../lib/supabase';
import { COPY } from '../lib/copy';

type FilterType = 'all' | 'competitie' | 'beker';

interface ReviewStat {
  speler_naam: string;
  gemiddelde: number;
  aantal: number;
}

const StatList = ({ title, stats, getValue, icon, onClick }: any) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">{icon}{title}</h3>
    </div>
    <ul className="stat-list">
      {stats.slice(0, 10).map((stat: any, index: number) => {
        const value = getValue(stat);
        if (value === 0 || value === '0.00') return null;
        return (
          <motion.li
            key={stat.speler_naam}
            className="stat-list-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="stat-list-rank">{index + 1}</span>
            <span
              className="stat-list-player"
              onClick={() => onClick?.(stat.speler_naam)}
              style={onClick ? { cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' } : {}}
              onMouseEnter={e => onClick && (e.currentTarget.style.textDecorationColor = 'var(--color-primary)')}
              onMouseLeave={e => onClick && (e.currentTarget.style.textDecorationColor = 'transparent')}
            >
              {stat.speler_naam}
            </span>
            <span className="stat-list-value">{value}</span>
          </motion.li>
        );
      })}
    </ul>
  </div>
);

const ReviewList = ({ reviewStats, onClick }: { reviewStats: ReviewStat[]; onClick: (naam: string) => void }) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title"><Star size={24} /> ⭐ Reviews</h3>
    </div>
    <ul className="stat-list">
      {reviewStats.map((stat, index) => (
        <motion.li
          key={stat.speler_naam}
          className="stat-list-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <span className="stat-list-rank">{index + 1}</span>
          <span
            className="stat-list-player"
            onClick={() => onClick(stat.speler_naam)}
            style={{ cursor: 'pointer', color: 'var(--color-primary)', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
          >
            {stat.speler_naam}
          </span>
          <span className="stat-list-value" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: '#f59e0b', fontWeight: '700' }}>{stat.gemiddelde}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>({stat.aantal})</span>
          </span>
        </motion.li>
      ))}
    </ul>
  </div>
);

export const DetailedStatsPage = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterType>('all');
  const { stats, loading } = useFilteredStats(filter);
  const [reviewStats, setReviewStats] = useState<ReviewStat[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('speler_naam, score');

      if (!data) return;

      // Aggregeer per speler
      const per: Record<string, { som: number; aantal: number }> = {};
      data.forEach((r: any) => {
        if (!per[r.speler_naam]) per[r.speler_naam] = { som: 0, aantal: 0 };
        per[r.speler_naam].som += r.score;
        per[r.speler_naam].aantal += 1;
      });

      const result: ReviewStat[] = Object.entries(per)
        .map(([naam, v]) => ({
          speler_naam: naam,
          gemiddelde: Math.round((v.som / v.aantal) * 10) / 10,
          aantal: v.aantal,
        }))
        .filter(r => r.aantal >= 1)
        .sort((a, b) => b.gemiddelde - a.gemiddelde || b.aantal - a.aantal);

      setReviewStats(result);
    };
    fetchReviews();
  }, []);

  const goToProfile = (naam: string) => navigate(`/spelers/${naam.toLowerCase()}`);

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>{COPY.LOADING_STATS}</p>
        </div>
      </div>
    );
  }

  const topScorers = [...stats].sort((a, b) => b.doelpunten - a.doelpunten);
  const topCorners = [...stats].sort((a, b) => b.corner - a.corner);
  const topPenalties = [...stats].sort((a, b) => b.penalty - a.penalty);
  const goalsPerGame = [...stats]
    .filter(s => s.aanwezig >= 3)
    .map(s => ({ ...s, ratio: (s.doelpunten / s.aanwezig).toFixed(2) }))
    .sort((a: any, b: any) => parseFloat(b.ratio) - parseFloat(a.ratio));
  const attendance = [...stats].sort((a, b) => b.aanwezig - a.aanwezig);

  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">{COPY.STATS_DETAILED_TITLE}</h1>
        <p className="page-subtitle">{COPY.STATS_DETAILED_SUBTITLE}</p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button className={`filter-tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          <Trophy size={20} /> {COPY.STATS_FILTER_ALL}
        </button>
        <button className={`filter-tab ${filter === 'competitie' ? 'active' : ''}`} onClick={() => setFilter('competitie')}>
          {COPY.TYPE_COMPETITIE_ICON} {COPY.STATS_FILTER_COMPETITIE}
        </button>
        <button className={`filter-tab ${filter === 'beker' ? 'active' : ''}`} onClick={() => setFilter('beker')}>
          {COPY.TYPE_BEKER_ICON} {COPY.STATS_FILTER_BEKER}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-detailed-grid">
        <StatList title={COPY.STATS_SECTION_TOPSCORERS} stats={topScorers} getValue={(s: any) => s.doelpunten} icon={<Trophy size={24} />} onClick={goToProfile} />
        <StatList title={COPY.STATS_SECTION_GOALS_PER_GAME} stats={goalsPerGame} getValue={(s: any) => s.ratio} icon={<TrendingUp size={24} />} onClick={goToProfile} />
        <StatList title={COPY.STATS_SECTION_CORNERS} stats={topCorners} getValue={(s: any) => s.corner} icon={<Target size={24} />} onClick={goToProfile} />
        <StatList title={COPY.STATS_SECTION_PENALTIES} stats={topPenalties} getValue={(s: any) => s.penalty} icon={<Award size={24} />} onClick={goToProfile} />
        <StatList title={COPY.STATS_SECTION_ATTENDANCE} stats={attendance} getValue={(s: any) => s.aanwezig} icon={<Users size={24} />} onClick={goToProfile} />
        <ReviewList reviewStats={reviewStats} onClick={goToProfile} />
      </div>
    </div>
  );
};
