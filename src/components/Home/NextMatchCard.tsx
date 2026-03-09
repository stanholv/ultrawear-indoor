import { motion } from 'framer-motion';
import { Calendar, Clock, Trophy } from 'lucide-react';
import { Wedstrijd } from '../../lib/types';
import { COPY } from '../../lib/copy';

interface NextMatchCardProps {
  wedstrijden: Wedstrijd[];
}

export const NextMatchCard = ({ wedstrijden }: NextMatchCardProps) => {
  const NOW = new Date();
  const vandaag = NOW.toISOString().split('T')[0]; // 'YYYY-MM-DD'

  // Zoek volgende match — wedstrijden van vandaag tellen mee
  const nextMatch = wedstrijden
    .filter(w => w.datum >= vandaag)
    .sort((a, b) => new Date(a.datum).getTime() - new Date(b.datum).getTime())[0];

  // Zoek laatste gespeelde match — alleen wedstrijden van voor vandaag
  const gespeeldeWedstrijden = wedstrijden
    .filter(w => w.uitslag && w.uitslag !== '-' && w.datum < vandaag)
    .sort((a, b) => new Date(b.datum).getTime() - new Date(a.datum).getTime());

  const lastMatch = gespeeldeWedstrijden[0];

  // Bereken verwachte goals: gemiddelde van Ultrawear's goals in laatste 5 wedstrijden
  const laatste5 = gespeeldeWedstrijden.slice(0, 5);
  const verwachteGoals = (() => {
    if (laatste5.length === 0) return null;
    const totalGoals = laatste5.reduce((sum, w) => {
      const wasHome = w.thuisploeg === 'Ultrawear Indoor';
      const scores = w.uitslag.split('-').map((s: string) => parseInt(s.trim()));
      if (scores.length !== 2) return sum;
      const ultrawearGoals = wasHome ? scores[0] : scores[1];
      return sum + (isNaN(ultrawearGoals) ? 0 : ultrawearGoals);
    }, 0);
    return Math.round(totalGoals / laatste5.length);
  })();

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
      {nextMatch && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="card card-hero"
          style={{ padding: 'var(--spacing-md) var(--spacing-lg)' }}
        >
          {/* Header: titel + thuis/uit badge op één lijn */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
            <span style={{ fontSize: '0.75rem', opacity: 0.75, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ⚽ {COPY.HOME_NEXT_MATCH_TITLE}
            </span>
            <span className="badge" style={{ background: isHome ? '#10b981' : '#f59e0b', fontSize: '0.7rem' }}>
              {isHome ? COPY.MATCH_THUIS : COPY.MATCH_UIT}
            </span>
          </div>

          {/* Tegenstander naam */}
          <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.5rem)', fontWeight: '800', color: 'white', lineHeight: 1.2, marginBottom: 'var(--spacing-sm)' }}>
            {isHome ? COPY.MATCH_VS : COPY.MATCH_AT} {isHome ? nextMatch.uitploeg : nextMatch.thuisploeg}
          </div>

          {/* Datum + tijd + verwacht inline */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md)', alignItems: 'center', color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Calendar size={14} /> {matchDate}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} /> {nextMatch.tijd}
            </div>
            {verwachteGoals !== null && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', opacity: 0.75 }}>
                🎯 ~{verwachteGoals} goals verwacht
              </div>
            )}
          </div>

          {/* Motivatie tekst */}
          <div style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.6)', marginTop: 'var(--spacing-sm)' }}>
            💪 {isHome ? COPY.HOME_NEXT_MATCH_THUIS : COPY.HOME_NEXT_MATCH_UIT}
          </div>
        </motion.div>
      )}

      {lastMatchDisplay && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          style={{ 
            padding: 'var(--spacing-sm) var(--spacing-md)', 
            background: 'var(--color-surface)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--color-border)', 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--spacing-sm)',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={16} color="var(--color-primary)" />
            <span style={{ fontWeight: '600', color: 'var(--color-text-secondary)' }}>Laatste:</span>
            <span>
              {lastMatchDisplay.wasHome ? 'vs' : '@'} <strong>{lastMatchDisplay.opponent}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ 
              color: lastMatchDisplay.result === 'W' ? '#10b981' : 
                     lastMatchDisplay.result === 'L' ? '#ef4444' : '#f59e0b',
              fontWeight: '700',
            }}>
              {lastMatchDisplay.score}
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)' }}>
              ({lastMatchDisplay.location === 'thuis' ? '🏠' : '✈️'} {lastMatchDisplay.result})
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};
