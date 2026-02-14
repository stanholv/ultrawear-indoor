import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Award, TrendingUp } from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { COPY } from '../lib/copy';

type FilterType = 'all' | 'competitie' | 'beker';

const StatList = ({ title, stats, getValue, icon }: any) => (
  <div className="card">
    <div className="card-header">
      <h3 className="card-title">
        {icon}
        {title}
      </h3>
    </div>
    <ul className="stat-list">
      {stats.slice(0, 10).map((stat: any, index: number) => {
        const value = getValue(stat);
        if (value === 0) return null;
        
        return (
          <motion.li
            key={stat.speler_naam}
            className="stat-list-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <span className="stat-list-rank">{index + 1}</span>
            <span className="stat-list-player">{stat.speler_naam}</span>
            <span className="stat-list-value">{value}</span>
          </motion.li>
        );
      })}
    </ul>
  </div>
);

export const DetailedStatsPage = () => {
  const { stats, loading } = useStats();
  const [filter, setFilter] = useState<FilterType>('all');
  
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
  
  // TODO: Implement actual filtering by match type when available
  const filteredStats = stats;
  
  // Top Scorers
  const topScorers = [...filteredStats]
    .sort((a, b) => b.doelpunten - a.doelpunten)
    .slice(0, 10);
  
  // Corners
  const topCorners = [...filteredStats]
    .sort((a, b) => b.corner - a.corner)
    .slice(0, 10);
  
  // Penalties
  const topPenalties = [...filteredStats]
    .sort((a, b) => b.penalty - a.penalty)
    .slice(0, 10);
  
  // Goals per Game (min 3 matches)
  const goalsPerGame = [...filteredStats]
    .filter(s => s.aanwezig >= 3)
    .map(s => ({
      ...s,
      ratio: (s.doelpunten / s.aanwezig).toFixed(2)
    }))
    .sort((a: any, b: any) => parseFloat(b.ratio) - parseFloat(a.ratio))
    .slice(0, 10);
  
  // Attendance
  const attendance = [...filteredStats]
    .sort((a, b) => b.aanwezig - a.aanwezig)
    .slice(0, 10);
  
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">{COPY.STATS_DETAILED_TITLE}</h1>
        <p className="page-subtitle">{COPY.STATS_DETAILED_SUBTITLE}</p>
      </div>
      
      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <Trophy size={20} />
          {COPY.STATS_FILTER_ALL}
        </button>
        <button
          className={`filter-tab ${filter === 'competitie' ? 'active' : ''}`}
          onClick={() => setFilter('competitie')}
        >
          {COPY.TYPE_COMPETITIE_ICON} {COPY.STATS_FILTER_COMPETITIE}
        </button>
        <button
          className={`filter-tab ${filter === 'beker' ? 'active' : ''}`}
          onClick={() => setFilter('beker')}
        >
          {COPY.TYPE_BEKER_ICON} {COPY.STATS_FILTER_BEKER}
        </button>
      </div>
      
      {/* Stats Grid */}
      <div className="stats-detailed-grid">
        <StatList
          title={COPY.STATS_SECTION_TOPSCORERS}
          stats={topScorers}
          getValue={(s: any) => s.doelpunten}
          icon={<Trophy size={24} />}
        />
        
        <StatList
          title={COPY.STATS_SECTION_GOALS_PER_GAME}
          stats={goalsPerGame}
          getValue={(s: any) => s.ratio}
          icon={<TrendingUp size={24} />}
        />
        
        <StatList
          title={COPY.STATS_SECTION_CORNERS}
          stats={topCorners}
          getValue={(s: any) => s.corner}
          icon={<Target size={24} />}
        />
        
        <StatList
          title={COPY.STATS_SECTION_PENALTIES}
          stats={topPenalties}
          getValue={(s: any) => s.penalty}
          icon={<Award size={24} />}
        />
        
        <StatList
          title={COPY.STATS_SECTION_ATTENDANCE}
          stats={attendance}
          getValue={(s: any) => s.aanwezig}
          icon={<Award size={24} />}
        />
      </div>
    </div>
  );
};
