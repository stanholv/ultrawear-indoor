import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, TrendingUp } from 'lucide-react';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { useStats } from '../../hooks/useStats';

export const NextMatchCard = () => {
  const { wedstrijden, loading } = useWedstrijden();
  
  // Vind volgende wedstrijd (datum >= vandaag)
  const nextMatch = wedstrijden
    .filter(w => new Date(w.datum) >= new Date())
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())[0];
  
  if (loading) {
    return (
      <div className="card card-hero animate-pulse" style={{ minHeight: '200px' }}>
        <div style={{ color: 'rgba(255,255,255,0.7)' }}>Laden...</div>
      </div>
    );
  }
  
  if (!nextMatch) {
    return (
      <div className="card card-hero">
        <div className="card-header">
          <h2 className="card-title">⚽ Volgende Wedstrijd</h2>
        </div>
        <p style={{ opacity: 0.9 }}>Geen geplande wedstrijden op dit moment</p>
      </div>
    );
  }
  
  // Bepaal of thuis of uit
  const isHome = nextMatch.thuisploeg === 'Ultrawear Indoor';
  const opponent = isHome ? nextMatch.uitploeg : nextMatch.thuisploeg;
  const location = isHome ? 'Thuis' : 'Uit';
  
  // Format datum
  const matchDate = new Date(nextMatch.datum);
  const dateStr = matchDate.toLocaleDateString('nl-BE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long' 
  });
  
  // Bereken expected goals (gemiddelde laatste 3 wedstrijden)
  const recentMatches = wedstrijden
    .filter(w => new Date(w.datum) < new Date() && w.uitslag && w.uitslag !== '-')
    .slice(0, 3);
  
  let expectedGoals = 0;
  if (recentMatches.length > 0) {
    const totalGoals = recentMatches.reduce((sum, match) => {
      const scores = (match.uitslag ?? '').split('-');
      if (scores.length < 2) return sum;
      const ourScore = match.thuisploeg === 'Ultrawear Indoor'
        ? parseInt(scores[0])
        : parseInt(scores[1]);
      return sum + (isNaN(ourScore) ? 0 : ourScore);
    }, 0);
    expectedGoals = Math.round(totalGoals / recentMatches.length);
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card card-hero"
      style={{ position: 'relative', zIndex: 1 }}
    >
      <div className="card-header" style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
        <h2 className="card-title">
          ⚽ Volgende Wedstrijd
        </h2>
        <span className="badge" style={{ background: isHome ? '#10b981' : '#f59e0b' }}>
          {location}
        </span>
      </div>
      
      <div style={{ padding: 'var(--spacing-lg) 0' }}>
        <h3 style={{ 
          fontSize: '2rem', 
          fontWeight: '800', 
          marginBottom: 'var(--spacing-md)',
          color: 'white'
        }}>
          {isHome ? 'vs' : '@'} {opponent}
        </h3>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: 'var(--spacing-lg)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <Calendar size={20} style={{ opacity: 0.8 }} />
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Datum</div>
              <div style={{ fontWeight: '600' }}>{dateStr}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
            <Clock size={20} style={{ opacity: 0.8 }} />
            <div>
              <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Uur</div>
              <div style={{ fontWeight: '600' }}>{nextMatch.tijd}</div>
            </div>
          </div>
          
          {expectedGoals > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <TrendingUp size={20} style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Verwacht</div>
                <div style={{ fontWeight: '600' }}>{expectedGoals} goals</div>
              </div>
            </div>
          )}
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: 'var(--spacing-md)', 
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem'
        }}>
          💪 {isHome ? 'Thuisvoordeel - Maak er een feest van!' : 'Uitwedstrijd - Laat zien wat we waard zijn!'}
        </div>
      </div>
    </motion.div>
  );
};
