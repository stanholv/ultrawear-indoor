import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Wedstrijd } from '../../lib/types';
import { COPY } from '../../lib/copy';

interface NextMatchCardProps {
  wedstrijden: Wedstrijd[];
}

export const NextMatchCard = ({ wedstrijden }: NextMatchCardProps) => {
  const NOW = new Date();
  
  // Zoek volgende match
  const nextMatch = wedstrijden
    .filter(w => new Date(w.datum) >= NOW)
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())[0];

  // Zoek laatste gespeelde match voor de uitslag
  const lastMatch = wedstrijden
    .filter(w => w.uitslag && w.uitslag !== '-' && new Date(w.datum) < NOW)
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime())[0];

  if (!nextMatch && !lastMatch) return null;

  const isHome = nextMatch?.thuisploeg === 'Ultrawear Indoor';
  const matchDate = nextMatch ? new Date(nextMatch.datum).toLocaleDateString('nl-BE', { 
    weekday: 'long', day: 'numeric', month: 'long' 
  }) : '';

  // Parse laatste wedstrijd uitslag correct (vanuit Ultrawear perspectief)
  const lastMatchDisplay = lastMatch ? (() => {
    const wasHome = lastMatch.thuisploeg === 'Ultrawear Indoor';
    const opponent = wasHome ? lastMatch.uitploeg : lastMatch.thuisploeg;
    const location = wasHome ? 'thuis' : 'uit';
    
    // Parse uitslag
    let ultrawearScore = 0;
    let opponentScore = 0;
    
    if (lastMatch.uitslag && lastMatch.uitslag !== '-') {
      const scores = lastMatch.uitslag.split('-').map(s => parseInt(s.trim()));
      if (scores.length === 2) {
        if (wasHome) {
          // Thuis: eerste score is van Ultrawear
          ultrawearScore = scores[0];
          opponentScore = scores[1];
        } else {
          // Uit: tweede score is van Ultrawear (omdraaien!)
          ultrawearScore = scores[1];
          opponentScore = scores[0];
        }
      }
    }
    
    const result = ultrawearScore > opponentScore ? 'W' : 
                   ultrawearScore < opponentScore ? 'L' : 'D';
    
    return {
      opponent,
      location,
      score: `${ultrawearScore}-${opponentScore}`,
      result,
      wasHome
    };
  })() : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {nextMatch && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="card card-hero"
        >
          <div className="card-header" style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
            <h2 className="card-title">⚽ {COPY.HOME_NEXT_MATCH_TITLE} {isHome ? COPY.MATCH_THUIS : COPY.MATCH_UIT}</h2>
            <span className="badge" style={{ background: isHome ? '#10b981' : '#f59e0b' }}>
              {isHome ? COPY.MATCH_THUIS : COPY.MATCH_UIT}
            </span>
          </div>
          
          <div style={{ padding: 'var(--spacing-lg) 0' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', margin: 0 }}>
              {isHome ? COPY.MATCH_VS : COPY.MATCH_AT} {isHome ? nextMatch.uitploeg : nextMatch.thuisploeg}
            </h3>
            
            <div style={{ display: 'flex', gap: 'var(--spacing-xl)', marginTop: 'var(--spacing-md)', color: 'rgba(255,255,255,0.9)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={18} /> {matchDate}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} /> {nextMatch.tijd}
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.1)', padding: 'var(--spacing-md)', borderRadius: 'var(--radius-md)', marginTop: 'var(--spacing-sm)' }}>
             <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Verwacht</div>
             <div style={{ fontWeight: 'bold' }}>4 goals</div>
             <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                💪 {isHome ? COPY.HOME_NEXT_MATCH_THUIS : COPY.HOME_NEXT_MATCH_UIT}
             </div>
          </div>
        </motion.div>
      )}

      {lastMatchDisplay && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          style={{ 
            padding: 'var(--spacing-md)', 
            background: 'var(--color-surface)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--color-border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-sm)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Trophy size={20} color="var(--color-primary)" />
            <span style={{ fontWeight: '600' }}>Laatste wedstrijd:</span>
          </div>
          <span style={{ color: 'var(--color-text-secondary)' }}>
            <span style={{ fontWeight: '600' }}>Ultrawear Indoor</span>
            {' '}
            {lastMatchDisplay.wasHome ? 'vs' : '@'}
            {' '}
            {lastMatchDisplay.opponent}
            {' - '}
            <span style={{ 
              color: lastMatchDisplay.result === 'W' ? '#10b981' : 
                     lastMatchDisplay.result === 'L' ? '#ef4444' : '#f59e0b',
              fontWeight: 'bold', 
              marginLeft: '5px' 
            }}>
              {lastMatchDisplay.score}
            </span>
            {' '}
            <span style={{ fontSize: '0.9rem' }}>
              ({lastMatchDisplay.location === 'thuis' ? '🏠' : '✈️'} {lastMatchDisplay.result})
            </span>
          </span>
        </motion.div>
      )}
    </div>
  );
};
