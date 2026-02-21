import { useNavigate } from 'react-router-dom';
import { StatsTable } from './StatsTable';
import { StatsOverview } from './StatsOverview';
import { COPY } from '../../lib/copy';
import { useStats } from '../../hooks/useStats';

export const StatsPage = () => {
  const { stats, loading } = useStats();
  const navigate = useNavigate();

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
      
      <StatsOverview stats={stats} />
      <StatsTable stats={stats} />
    </div>
  );
};