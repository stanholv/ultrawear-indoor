import { StatsTable } from './StatsTable';
import { StatsOverview } from './StatsOverview';
import { COPY } from '../../lib/copy';

export const StatsPage = () => {
  return (
    <div className="main-content">
      <div className="page-header">
        <h1 className="page-title">{COPY.STATS_PAGE_TITLE}</h1>
        <p className="page-subtitle">{COPY.STATS_PAGE_SUBTITLE}</p>
      </div>
      
      <StatsOverview />
      <StatsTable />
    </div>
  );
};