import { useStats } from '../../hooks/useStats';

export const AdminDashboard = () => {
  const { stats, loading } = useStats();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Dashboard laden...</p>
      </div>
    );
  }

  // Calculate dashboard metrics
  const totalPlayers = stats.length;
  const totalMatches = stats.length > 0 ? Math.max(...stats.map(s => s.aanwezig)) : 0;
  const totalGoals = stats.reduce((sum, s) => sum + s.doelpunten, 0);
  const totalCornerGoals = stats.reduce((sum, s) => sum + s.corner, 0);

  return (
    <div>
      <h2 style={{ marginBottom: 'var(--spacing-lg)', fontSize: '1.5rem', fontWeight: 700 }}>
        📊 Admin Dashboard
      </h2>

      <div className="dashboard-container">
        <div className="dashboard-card">
          <div className="dashboard-card-icon">👥</div>
          <div className="dashboard-card-value">{totalPlayers}</div>
          <div className="dashboard-card-label">Spelers</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">⚽</div>
          <div className="dashboard-card-value">{totalGoals}</div>
          <div className="dashboard-card-label">Goals Totaal</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">🔺</div>
          <div className="dashboard-card-value">{totalCornerGoals}</div>
          <div className="dashboard-card-label">Goals uit Corner</div>
        </div>

        <div className="dashboard-card">
          <div className="dashboard-card-icon">🎮</div>
          <div className="dashboard-card-value">{totalMatches}</div>
          <div className="dashboard-card-label">Wedstrijden</div>
        </div>
      </div>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 'var(--spacing-lg)' }}>
          🏆 Top Spelers
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {stats
            .sort((a, b) => b.doelpunten - a.doelpunten)
            .slice(0, 6)
            .map((player, idx) => (
              <div key={idx} style={{
                background: 'var(--color-white)',
                padding: 'var(--spacing-lg)',
                borderRadius: 'var(--border-radius-lg)',
                boxShadow: 'var(--shadow-md)',
                borderLeft: '4px solid var(--color-primary)',
              }}>
                <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: 'var(--spacing-sm)' }}>
                  {idx + 1}. {player.speler_naam}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {player.doelpunten}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#999', marginTop: 'var(--spacing-sm)' }}>
                  ⚽ Goals | ✔ {player.aanwezig}x Aanwezig
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
