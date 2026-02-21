import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWedstrijden } from '../../hooks/useWedstrijden';

export const UitslagenPage = () => {
  const { wedstrijden, loading } = useWedstrijden();
  const [filterType, setFilterType] = useState<'all' | 'competitie' | 'beker'>('all');
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="animate-pulse">Laden...</div>
      </div>
    );
  }

  // Filter en sorteer wedstrijden - EERST DUPLICATEN VERWIJDEREN
  const uniqueWedstrijden = wedstrijden.reduce((acc, current) => {
    // Alleen wedstrijden met een uitslag
    if (!current.uitslag || current.uitslag === '-') {
      return acc;
    }

    // Maak een unieke key
    const key = `${current.datum}-${current.tijd}-${current.thuisploeg}-${current.uitploeg}`;

    // Check of we deze combinatie al hebben
    const exists = acc.find(item =>
      `${item.datum}-${item.tijd}-${item.thuisploeg}-${item.uitploeg}` === key
    );

    if (!exists) {
      acc.push(current);
    }

    return acc;
  }, [] as typeof wedstrijden);

  // Dan filteren op type en sorteren
  const filteredWedstrijden = uniqueWedstrijden
    .filter(w => filterType === 'all' || w.type === filterType)
    .sort((a, b) => {
      const dateA = new Date(a.datum + ' ' + a.tijd);
      const dateB = new Date(b.datum + ' ' + b.tijd);
      return dateA.getTime() - dateB.getTime();
    });

  // Bereken statistieken
  let gewonnen = 0;
  let gelijk = 0;
  let verloren = 0;
  let punten = 0;
  let doelpuntenVoor = 0;
  let doelpuntenTegen = 0;

  filteredWedstrijden.forEach(w => {
    if (!w.uitslag || w.uitslag === '-') return;

    const [thuis, uit] = w.uitslag.split('-').map(Number);
    const isThuis = w.thuisploeg === 'Ultrawear Indoor';
    const ultraGoals = isThuis ? thuis : uit;
    const tegenGoals = isThuis ? uit : thuis;

    doelpuntenVoor += ultraGoals;
    doelpuntenTegen += tegenGoals;

    if (ultraGoals > tegenGoals) {
      gewonnen++;
      punten += 3;
    } else if (ultraGoals === tegenGoals) {
      gelijk++;
      punten += 1;
    } else {
      verloren++;
    }
  });

  const getResultIcon = (wedstrijd: any) => {
    if (!wedstrijd.uitslag || wedstrijd.uitslag === '-') return null;

    const [thuis, uit] = wedstrijd.uitslag.split('-').map(Number);
    const isThuis = wedstrijd.thuisploeg === 'Ultrawear Indoor';
    const ultraGoals = isThuis ? thuis : uit;
    const tegenGoals = isThuis ? uit : thuis;

    if (ultraGoals > tegenGoals) {
      return { icon: <TrendingUp size={20} />, color: 'var(--color-success)', label: 'W' };
    } else if (ultraGoals === tegenGoals) {
      return { icon: <Minus size={20} />, color: '#f59e0b', label: 'D' };
    } else {
      return { icon: <TrendingDown size={20} />, color: '#ef4444', label: 'L' };
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="page-header">
          <h1 className="page-title">
            <Trophy size={32} /> Uitslagen & Klassement
          </h1>
          <p className="page-subtitle">
            Overzicht van alle gespeelde wedstrijden en punten
          </p>
        </div>

        {/* Statistieken Overview */}
        <div className="stats-grid" style={{ marginBottom: 'var(--spacing-xl)' }}>
          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Totaal Punten</div>
                <div className="stat-value">{punten}</div>
                <div className="stat-detail">{filteredWedstrijden.length} wedstrijden</div>
              </div>
              <div className="stat-icon"><Trophy size={24} /></div>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Balans</div>
                <div style={{ display: 'flex', gap: 'var(--spacing-md)', marginTop: 'var(--spacing-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-success)' }}>W</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{gewonnen}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>D</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{gelijk}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>L</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>{verloren}</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="stat-card-header">
              <div>
                <div className="stat-label">Doelpunten</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', marginTop: 'var(--spacing-sm)' }}>
                  {doelpuntenVoor} - {doelpuntenTegen}
                </div>
                <div className="stat-detail">
                  Saldo: {doelpuntenVoor - doelpuntenTegen > 0 ? '+' : ''}{doelpuntenVoor - doelpuntenTegen}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filter */}
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div style={{ padding: 'var(--spacing-md)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            <Filter size={20} color="var(--color-text-secondary)" />
            <div className="radio-group" style={{ margin: 0 }}>
              <label className="radio-label" style={{ margin: 0 }}>
                <input
                  type="radio"
                  name="filter"
                  checked={filterType === 'all'}
                  onChange={() => setFilterType('all')}
                />
                <span className="radio-text">Alles</span>
              </label>
              <label className="radio-label" style={{ margin: 0 }}>
                <input
                  type="radio"
                  name="filter"
                  checked={filterType === 'competitie'}
                  onChange={() => setFilterType('competitie')}
                />
                <span className="radio-text">🏆 Competitie</span>
              </label>
              <label className="radio-label" style={{ margin: 0 }}>
                <input
                  type="radio"
                  name="filter"
                  checked={filterType === 'beker'}
                  onChange={() => setFilterType('beker')}
                />
                <span className="radio-text">🏅 Beker</span>
              </label>
            </div>
          </div>
        </div>

        {/* Uitslagen Lijst */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">
              <Calendar size={24} /> Wedstrijden ({filteredWedstrijden.length})
            </h2>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              Klik op een wedstrijd voor spelersstatistieken
            </div>
          </div>

          <div style={{ padding: 'var(--spacing-lg)' }}>
            {filteredWedstrijden.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-secondary)' }}>
                Geen wedstrijden gevonden voor deze filter
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                {filteredWedstrijden.map((wedstrijd, index) => {
                  const result = getResultIcon(wedstrijd);
                  if (!result) return null;

                  const isThuis = wedstrijd.thuisploeg === 'Ultrawear Indoor';
                  const tegenstander = isThuis ? wedstrijd.uitploeg : wedstrijd.thuisploeg;
                  const [thuis, uit] = wedstrijd.uitslag!.split('-').map(Number);

                  return (
                    <motion.div
                      key={wedstrijd.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => navigate(`/uitslagen/${wedstrijd.id}`)}
                      className="wedstrijd-row"
                    >
                      {/* Result Bubble */}
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: result.color + '20',
                          color: result.color,
                          fontWeight: '700',
                          flexShrink: 0,
                        }}
                      >
                        {result.label}
                      </div>

                      {/* Match Info */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '1.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isThuis ? 'vs' : '@'} {tegenstander}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                          {new Date(wedstrijd.datum).toLocaleDateString('nl-BE', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })} • {wedstrijd.tijd}
                        </div>
                      </div>

                      {/* Score */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                          {isThuis ? `${thuis} - ${uit}` : `${uit} - ${thuis}`}
                        </div>
                      </div>

                      {/* Type Badge */}
                      <span
                        className="badge"
                        style={{
                          background: 'var(--color-secondary)',
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {wedstrijd.type === 'beker' ? '🏆' : '🥇'}
                      </span>

                      {/* Location Badge */}
                      <span
                        className="badge"
                        style={{
                          background: isThuis ? 'var(--color-success)' : '#f59e0b',
                          fontSize: '0.75rem',
                          flexShrink: 0,
                        }}
                      >
                        {isThuis ? '🏠' : '✈️'}
                      </span>

                      {/* Chevron */}
                      <ChevronRight size={18} color="var(--color-text-tertiary)" style={{ flexShrink: 0 }} />
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
