import { StatsTable } from './StatsTable';
import { StatsOverview } from './StatsOverview';
import { COPY } from '../../lib/copy';
import { useStats } from '../../hooks/useStats';

export const StatsPage = () => {
  const { stats, loading } = useStats();

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
      <div className="page-header">
        <h1 className="page-title">{COPY.STATS_PAGE_TITLE}</h1>
        <p className="page-subtitle">{COPY.STATS_PAGE_SUBTITLE}</p>
      </div>
      
      {/* HIER ZAT DE FOUT: Je moet 'stats' meegeven als prop */}
      <StatsOverview stats={stats} />
      <StatsTable stats={stats} />
    </div>
  );
};