import type { CSSProperties } from 'react';
import { AggregatedStats } from '../../lib/types';

// Deze interface MOET exact overeenkomen met wat StatsPage verstuurt
interface StatsOverviewProps {
  stats: AggregatedStats[];
  owngoals?: number;
}

const redTick: CSSProperties = {
  width: 24, height: 3, background: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)',
};

export const StatsOverview = ({ stats, owngoals = 0 }: StatsOverviewProps) => {
  const spelerGoals = stats.reduce((sum, s) => sum + s.doelpunten, 0);
  const totalGoals = spelerGoals + owngoals; // teamtotaal = spelersgoals + owngoals
  const totalMatches = Math.max(...stats.map(s => s.aanwezig), 0);
  const topScorer = [...stats].sort((a, b) => b.doelpunten - a.doelpunten)[0];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-2xl)' }}>
      <div>
        <div style={redTick} />
        <div className="scoreboard" style={{ fontSize: 'clamp(2.2rem, 9vw, 3rem)' }}>{totalGoals}</div>
        <div className="kicker" style={{ marginTop: '4px' }}>Totaal goals</div>
        {owngoals > 0 && (
          <div style={{ fontFamily: 'var(--font-cond)', fontSize: '0.72rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>
            {spelerGoals} spelers + {owngoals} owngoals
          </div>
        )}
      </div>

      <div>
        <div style={redTick} />
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.6rem, 7vw, 2.2rem)', lineHeight: 1, color: 'var(--color-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {topScorer?.speler_naam || '-'}
        </div>
        <div className="kicker" style={{ marginTop: '4px' }}>Topscorer · {topScorer?.doelpunten || 0} goals</div>
      </div>

      <div>
        <div style={redTick} />
        <div className="scoreboard" style={{ fontSize: 'clamp(2.2rem, 9vw, 3rem)' }}>{totalMatches}</div>
        <div className="kicker" style={{ marginTop: '4px' }}>Team matchen</div>
      </div>
    </div>
  );
};
