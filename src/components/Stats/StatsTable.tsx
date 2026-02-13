import { useStats } from '../../hooks/useStats';

export const StatsTable = () => {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Statistieken laden...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        Fout bij laden statistieken: {error}
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="empty-state">
        <p>Nog geen statistieken beschikbaar</p>
      </div>
    );
  }

  const maxAanwezig = Math.max(...stats.map(s => s.aanwezig));
  const maxDoelpunten = Math.max(...stats.map(s => s.doelpunten));

  return (
    <div className="stats-container">
      <table className="stats-table">
        <thead>
          <tr>
            <th>Speler</th>
            <th>✔ Aanwezig</th>
            <th>⚽ Doelpunten totaal</th>
            <th>🔺 Goals uit corner</th>
            <th>🎯 Penalties</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => {
            const aanwezigPercentage = maxAanwezig > 0 ? (stat.aanwezig / maxAanwezig) * 100 : 0;
            const doelpuntenPercentage = maxDoelpunten > 0 ? (stat.doelpunten / maxDoelpunten) * 100 : 0;
            const cornerPercentage = stat.doelpunten > 0 ? (stat.corner / stat.doelpunten) * 100 : 0;
            const isTopScorer = stat.doelpunten === maxDoelpunten && maxDoelpunten > 0;

            return (
              <tr key={stat.speler_naam}>
                <td className="player-name">
                  {stat.speler_naam}
                  {isTopScorer && ' 🔥'}
                </td>
                <td>
                  <div className="stat-cell">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${aanwezigPercentage}%` }}
                    />
                    <div className="stat-value">{stat.aanwezig}</div>
                  </div>
                </td>
                <td>
                  <div className="stat-cell">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${doelpuntenPercentage}%` }}
                    />
                    <div className="stat-value">{stat.doelpunten}</div>
                  </div>
                </td>
                <td>
                  <div className="stat-cell">
                    <div 
                      className="progress-bar progress-bar-secondary" 
                      style={{ width: `${cornerPercentage}%` }}
                    />
                    <div className="stat-value">{stat.corner}</div>
                  </div>
                </td>
                <td className="stat-number">{stat.penalty}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
