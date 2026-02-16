import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Award, Users, Facebook, BarChart2 } from 'lucide-react';
import { NextMatchCard } from './NextMatchCard';
import { TopScorerTable } from './TopScorerTable';
import { useStats } from '../../hooks/useStats';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { COPY } from '../../lib/copy';

const StatCard = ({ icon, title, player, value, subtitle, delay = 0 }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay }} 
    className="stat-card"
  >
    <div className="stat-card-header">
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {player && (
          <div style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'var(--color-primary)', 
            marginTop: 'var(--spacing-sm)' 
          }}>
            {player}
          </div>
        )}
        {subtitle && <div className="stat-detail">{subtitle}</div>}
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  </motion.div>
);

export const HomePage = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useStats();
  const { wedstrijden, loading: matchesLoading } = useWedstrijden();
  
  if (statsLoading || matchesLoading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="animate-pulse">{COPY.LOADING}</div>
      </div>
    );
  }

  // Top Scorer (alleen op goals)
  const topScorer = [...stats].sort((a, b) => b.doelpunten - a.doelpunten)[0] || { 
    speler_naam: '-', 
    doelpunten: 0, 
    aanwezig: 0 
  };
  
  // Goals per Game (min 3 wedstrijden)
  const goalsPerGameLeader = stats
    .filter(s => s.aanwezig >= 3)
    .map(s => ({ ...s, ratio: (s.doelpunten / s.aanwezig).toFixed(2) }))
    .sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio))[0];
  
  // Meeste wedstrijden
  const maxGames = Math.max(...stats.map(s => s.aanwezig), 0);
  const mostGamesPlayers = stats
    .filter(s => s.aanwezig === maxGames)
    .map(s => s.speler_naam);
  
  // Totale stats - FIXED: gebruik alleen wedstrijden met een uitslag
  const totalGoals = stats.reduce((sum, s) => sum + s.doelpunten, 0);
  
  // Filter op unieke wedstrijden die gespeeld zijn (hebben een uitslag en niet '-')
  const uniquePlayedMatches = wedstrijden.reduce((acc, current) => {
    // Alleen wedstrijden met een uitslag die niet '-' is
    if (!current.uitslag || current.uitslag === '-') {
      return acc;
    }
    
    // Maak een unieke key
    const key = `${current.datum}-${current.tijd}-${current.thuisploeg}-${current.uitploeg}`;
    
    // Check of we deze combinatie al hebben
    const exists = acc.find(item => 
      `${item.datum}-${item.tijd}-${item.thuisploeg}-${item.uitploeg}` === key
    );
    
    if (!exists) {
      acc.push(current);
    }
    
    return acc;
  }, [] as typeof wedstrijden);
  
  const totalMatches = uniquePlayedMatches.length;
  const activePlayers = stats.filter(s => s.aanwezig > 0).length;

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-content">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="hero-title">
              Welkom bij <span style={{ color: 'var(--color-primary)' }}>{COPY.HERO_TITLE}</span>
            </h1>
            <p className="hero-subtitle">{COPY.HERO_SUBTITLE}</p>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container" style={{ padding: 'var(--spacing-2xl) var(--spacing-xl)' }}>
        
        {/* Next Match Card */}
        <NextMatchCard wedstrijden={wedstrijden} />
        
        {/* Stats Grid */}
        <div className="stats-grid" style={{ marginTop: 'var(--spacing-2xl)' }}>
          <StatCard 
            icon={<Trophy size={24} />} 
            title={COPY.HOME_STAT_TOPSCORER} 
            player={topScorer.speler_naam} 
            value={topScorer.doelpunten} 
            subtitle={`${topScorer.aanwezig} wedstrijden`} 
            delay={0.1} 
          />
          
          <StatCard 
            icon={<Target size={24} />} 
            title={COPY.HOME_STAT_GOALS_PER_GAME} 
            player={goalsPerGameLeader?.speler_naam || '-'} 
            value={goalsPerGameLeader?.ratio || '0.00'} 
            subtitle={`${goalsPerGameLeader?.doelpunten || 0} goals in ${goalsPerGameLeader?.aanwezig || 0} wed.`} 
            delay={0.2} 
          />
          
          <StatCard 
            icon={<Award size={24} />} 
            title={COPY.HOME_STAT_MOST_GAMES} 
            player={mostGamesPlayers.length <= 2 ? mostGamesPlayers.join(' & ') : `${mostGamesPlayers.length} spelers`} 
            value={maxGames} 
            subtitle={mostGamesPlayers.length === 1 ? COPY.HOME_STAT_LOYAL_PLAYER : COPY.HOME_STAT_LOYAL_PLAYERS} 
            delay={0.3} 
          />
        </div>

        {/* Season Stats Overview */}
        <motion.div 
          className="card" 
          style={{ marginTop: 'var(--spacing-2xl)' }} 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }}
        >
          <div className="card-header">
            <h2 className="card-title">
              <Users size={24} /> {COPY.HOME_STATS_OVERVIEW_TITLE}
            </h2>
          </div>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: 'var(--spacing-xl)', 
            padding: 'var(--spacing-lg) 0' 
          }}>
            <div>
              <div className="stat-label">Gespeelde Wedstrijden</div>
              <div className="stat-value">{totalMatches}</div>
            </div>
            <div>
              <div className="stat-label">{COPY.HOME_TOTAL_GOALS}</div>
              <div className="stat-value">{totalGoals}</div>
            </div>
            <div>
              <div className="stat-label">{COPY.HOME_AVG_PER_MATCH}</div>
              <div className="stat-value">
                {totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'}
              </div>
            </div>
            <div>
              <div className="stat-label">{COPY.HOME_ACTIVE_PLAYERS}</div>
              <div className="stat-value">{activePlayers}</div>
            </div>
          </div>
        </motion.div>

        {/* Top 5 Scorers */}
        <TopScorerTable stats={stats} />
        
        {/* Call to Actions */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--spacing-lg)', 
          marginTop: 'var(--spacing-2xl)' 
        }}>
          {/* Volledige Rankings */}
          <motion.div
            className="card" 
            style={{ 
              textDecoration: 'none', 
              borderLeft: '4px solid var(--color-primary)',
              cursor: 'pointer'
            }} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/statistieken')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Trophy size={32} color="var(--color-primary)" />
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  color: 'var(--color-text-primary)', 
                  margin: 0 
                }}>
                  {COPY.HOME_CTA_FULL_RANKINGS}
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--color-text-secondary)', 
                  margin: 0 
                }}>
                  {COPY.HOME_CTA_FULL_RANKINGS_SUB}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Uitgebreide Statistieken */}
          <motion.div
            className="card" 
            style={{ 
              textDecoration: 'none', 
              borderLeft: '4px solid #f59e0b',
              cursor: 'pointer'
            }} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/statistieken/details')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <BarChart2 size={32} color="#f59e0b" />
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  color: 'var(--color-text-primary)', 
                  margin: 0 
                }}>
                  {COPY.HOME_CTA_DETAILED_STATS}
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--color-text-secondary)', 
                  margin: 0 
                }}>
                  {COPY.HOME_CTA_DETAILED_STATS_SUB}
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Facebook - externe link blijft <a> */}
          <motion.a 
            href="https://www.facebook.com/profile.php?id=100067913117622" 
            target="_blank" 
            rel="noopener noreferrer"
            className="card" 
            style={{ 
              textDecoration: 'none', 
              borderLeft: '4px solid #1877F2',
              cursor: 'pointer'
            }} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Facebook size={32} color="#1877F2" />
              <div>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '700', 
                  color: 'var(--color-text-primary)', 
                  margin: 0 
                }}>
                  {COPY.FACEBOOK_LINK_TEXT}
                </h3>
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--color-text-secondary)', 
                  margin: 0 
                }}>
                  {COPY.FACEBOOK_LINK_SUBTITLE}
                </p>
              </div>
            </div>
          </motion.a>
        </div>
      </div>
    </div>
  );
};
