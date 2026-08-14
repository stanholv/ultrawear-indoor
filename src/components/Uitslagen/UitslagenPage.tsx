import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp, TrendingDown, Minus, Calendar, Filter, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { isGespeeld, scoreVan, teltVoorStats } from '../../lib/types';
import { useBadges } from '../../hooks/useBadges';

export const UitslagenPage = () => {
  const { wedstrijden, loading } = useWedstrijden();
  const { markSeen } = useBadges();
  const [filterType, setFilterType] = useState<'all' | 'competitie' | 'beker' | 'oefenwedstrijd'>('all');
  const navigate = useNavigate();

  useEffect(() => { markSeen('uitslagen'); }, [markSeen]);

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="animate-pulse">Laden...</div>
      </div>
    );
  }

  // Filter en sorteer wedstrijden - EERST DUPLICATEN VERWIJDEREN
  const uniqueWedstrijden = wedstrijden.reduce((acc, current) => {
    // Alleen écht gespeelde wedstrijden (uitslag + datum niet in de toekomst)
    if (!isGespeeld(current.datum, current.uitslag)) {
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
    // Oefenwedstrijden tellen niet mee voor klassement/punten.
    if (!teltVoorStats(w.type)) return;

    const score = scoreVan(w);
    if (!score) return;

    const isThuis = w.thuisploeg === 'Ultrawear Indoor';
    const ultraGoals = isThuis ? score.thuis : score.uit;
    const tegenGoals = isThuis ? score.uit : score.thuis;

    // Forfait telt voor de stand/punten, maar de score telt niet als doelpunten.
    if (!w.forfait) {
      doelpuntenVoor += ultraGoals;
      doelpuntenTegen += tegenGoals;
    }

    if (ultraGoals > tegenGoals) {
      gewonnen++;
      punten += 2;
    } else if (ultraGoals === tegenGoals) {
      gelijk++;
      punten += 1;
    } else {
      verloren++;
    }
  });

  const getResultIcon = (wedstrijd: any) => {
    const score = scoreVan(wedstrijd);
    if (!score) return null;

    const isThuis = wedstrijd.thuisploeg === 'Ultrawear Indoor';
    const ultraGoals = isThuis ? score.thuis : score.uit;
    const tegenGoals = isThuis ? score.uit : score.thuis;

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
              <label className="radio-label" style={{ margin: 0 }}>
                <input
                  type="radio"
                  name="filter"
                  checked={filterType === 'oefenwedstrijd'}
                  onChange={() => setFilterType('oefenwedstrijd')}
                />
                <span className="radio-text">⚽ Oefen</span>
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
                  const score = scoreVan(wedstrijd)!;
                  const thuis = score.thuis;
                  const uit = score.uit;

                  return (
                    <motion.div
                      key={wedstrijd.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => navigate(`/uitslagen/${wedstrijd.id}`)}
                      className="wedstrijd-row"
                    >
                      {/* Result square */}
                      <div className={`result-square ${result.label === 'W' ? 'win' : result.label === 'L' ? 'loss' : 'draw'}`}>
                        {result.label}
                      </div>

                      {/* Match info — naam + compacte meta (datum · thuis/uit · type · ff) */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '1.15rem', lineHeight: 1, letterSpacing: '0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {isThuis ? 'vs' : '@'} {tegenstander}
                        </div>
                        <div style={{ fontFamily: 'var(--font-cond)', fontSize: '0.72rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {new Date(wedstrijd.datum).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                          {' · '}{isThuis ? 'Thuis' : 'Uit'}
                          {wedstrijd.type === 'beker' ? ' · Beker' : wedstrijd.type === 'oefenwedstrijd' ? ' · Oefen' : ''}
                          {wedstrijd.forfait ? ' · FF' : ''}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="scoreline" style={{ color: 'var(--color-text-primary)', flexShrink: 0 }}>
                        {isThuis ? `${thuis}–${uit}` : `${uit}–${thuis}`}
                      </div>
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
