import { useNavigate } from 'react-router-dom';
import { StatsTable } from './StatsTable';
import { StatsOverview } from './StatsOverview';
import { COPY } from '../../lib/copy';
import { useStats } from '../../hooks/useStats';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { isGespeeld } from '../../lib/types';

export const StatsPage = () => {
  const { stats, loading } = useStats();
  const { wedstrijden } = useWedstrijden();
  const navigate = useNavigate();

  // Owngoals tellen mee in het teamtotaal (alleen gespeelde, niet-forfait matchen).
  const owngoals = wedstrijden
    .filter(w => isGespeeld(w.datum, w.uitslag) && !w.forfait)
    .reduce((sum, w) => sum + (w.owngoals ?? 0), 0);

  if (loading) {
    return (
      <div className="main-content">
        <div className="animate-pulse" style={{ color: 'var(--color-text-secondary)' }}>
          {COPY.LOADING}
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">{COPY.STATS_PAGE_TITLE}</h1>
          <p className="page-subtitle">{COPY.STATS_PAGE_SUBTITLE}</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/statistieken/details')} style={{ whiteSpace: 'nowrap' }}>
          Uitgebreide statistieken
        </button>
      </div>
      
      <StatsOverview stats={stats} owngoals={owngoals} />
      <StatsTable stats={stats} />
    </div>
  );
};