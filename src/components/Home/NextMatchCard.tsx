import { motion } from 'framer-motion';
// @ts-ignore
import { Calendar, Clock } from 'lucide-react';
import { Wedstrijd, scoreVan } from '../../lib/types';
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
      const score = scoreVan(w);
      if (!score) return sum;
      const ultrawearGoals = wasHome ? score.thuis : score.uit;
      return sum + ultrawearGoals;
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
    
    const score = scoreVan(lastMatch);
    if (score) {
      if (wasHome) {
        // Thuis: eerste score is van Ultrawear
        ultrawearScore = score.thuis;
        opponentScore = score.uit;
      } else {
        // Uit: tweede score is van Ultrawear (omdraaien!)
        ultrawearScore = score.uit;
        opponentScore = score.thuis;
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

  const resultClass = lastMatchDisplay
    ? (lastMatchDisplay.result === 'W' ? 'win' : lastMatchDisplay.result === 'L' ? 'loss' : 'draw')
    : '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
      {nextMatch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card card-hero"
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div className="stripe-accent" />
          <div style={{ padding: 'var(--spacing-lg)' }}>
            {/* Kicker + thuis/uit */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-md)' }}>
              <span className="kicker" style={{ color: 'rgba(255,255,255,0.9)' }}>
                {COPY.HOME_NEXT_MATCH_TITLE}
              </span>
              <span style={{
                border: '1px solid rgba(255,255,255,0.55)', color: '#fff',
                fontFamily: 'var(--font-cond)', textTransform: 'uppercase',
                letterSpacing: '0.08em', fontSize: '0.7rem', fontWeight: 600,
                padding: '2px 9px', borderRadius: 'var(--radius-sm)',
              }}>
                {isHome ? COPY.MATCH_THUIS : COPY.MATCH_UIT}
              </span>
            </div>

            {/* Fixture: ULTRAWEAR (vs/@) TEGENSTANDER */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
              <div style={{
                flex: 1, minWidth: 0, fontFamily: 'var(--font-display)', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(1.5rem, 6.5vw, 2.4rem)',
                lineHeight: 0.95, color: '#fff', wordBreak: 'break-word',
              }}>
                Ultrawear
              </div>
              <div style={{
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem',
                color: 'rgba(255,255,255,0.65)', padding: '0 2px', flexShrink: 0,
              }}>
                {isHome ? 'VS' : '@'}
              </div>
              <div style={{
                flex: 1, minWidth: 0, textAlign: 'right', fontFamily: 'var(--font-display)', fontWeight: 700,
                textTransform: 'uppercase', fontSize: 'clamp(1.5rem, 6.5vw, 2.4rem)',
                lineHeight: 0.95, color: '#fff', wordBreak: 'break-word',
              }}>
                {isHome ? nextMatch.uitploeg : nextMatch.thuisploeg}
              </div>
            </div>

            {/* Datum + tijd */}
            <div style={{
              marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)',
              borderTop: '1px solid rgba(255,255,255,0.25)',
              display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-lg)', alignItems: 'center',
              color: 'rgba(255,255,255,0.92)', fontFamily: 'var(--font-cond)',
              textTransform: 'uppercase', letterSpacing: '0.06em', fontSize: '0.82rem',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={14} /> {matchDate}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} /> {(nextMatch.tijd || '').slice(0, 5)}
              </span>
              {verwachteGoals !== null && (
                <span style={{ opacity: 0.75 }}>~{verwachteGoals} goals verwacht</span>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {lastMatchDisplay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
            padding: 'var(--spacing-sm) var(--spacing-xs)',
            borderTop: '2px solid var(--color-text-primary)',
          }}
        >
          <span className={`result-square ${resultClass}`}>{lastMatchDisplay.result}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="kicker">Laatste wedstrijd</div>
            <div style={{ fontFamily: 'var(--font-cond)', fontWeight: 600, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              {lastMatchDisplay.wasHome ? 'vs' : '@'} {lastMatchDisplay.opponent}
            </div>
          </div>
          <span className="scoreline" style={{ color: 'var(--color-text-primary)' }}>
            {lastMatchDisplay.score.replace('-', '–')}
          </span>
        </motion.div>
      )}
    </div>
  );
};
