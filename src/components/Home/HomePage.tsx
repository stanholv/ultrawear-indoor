import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Award, Users, Facebook, BarChart2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { NextMatchCard } from './NextMatchCard';
import { TopScorerTable } from './TopScorerTable';
import { InstallBanner } from './InstallBanner';
import { useStats } from '../../hooks/useStats';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { useSeizoen } from '../../hooks/useSeizoen';
import { seizoenSamenvatting } from '../../lib/seizoenArchief';
import { isGespeeld, teltVoorStats } from '../../lib/types';
import { COPY } from '../../lib/copy';
import { supabase } from '../../lib/supabase';

// ─── REVIEWS CAROUSEL ────────────────────────────────────────────────────────

interface RecentReview {
  id: string;
  speler_naam: string;
  score: number;
  commentaar?: string;
  reviewer_naam?: string;
  created_at: string;
}

const ReviewsCarousel = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<RecentReview[]>([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    supabase
      .from('reviews')
      .select('id, speler_naam, score, commentaar, reviewer_naam, created_at')
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => setReviews(data || []));
  }, []);

  const goTo = useCallback((newIndex: number, dir: number) => {
    setDirection(dir);
    setIndex(newIndex);
  }, []);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const timer = setInterval(() => goTo((index + 1) % reviews.length, 1), 5000);
    return () => clearInterval(timer);
  }, [index, reviews.length, goTo]);

  if (reviews.length === 0) return null;

  const review = reviews[index];

  return (
    <motion.div
      className="card"
      style={{ marginTop: 'var(--spacing-2xl)', overflow: 'hidden' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
    >
      <div className="card-header" style={{ paddingBottom: 'var(--spacing-sm)' }}>
        <h2
          className="card-title"
          style={{ fontSize: '1rem', cursor: 'pointer' }}
          onClick={() => navigate('/reviews')}
          onMouseEnter={e => (e.currentTarget.style.textDecorationLine = 'underline')}
          onMouseLeave={e => (e.currentTarget.style.textDecorationLine = 'none')}
        >
          <Star size={18} color="#f59e0b" fill="#f59e0b" /> Laatste reviews
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => navigate('/reviews')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '600', padding: '4px 6px' }}
          >
            Alle reviews →
          </button>
          {reviews.length > 1 && (
            <>
              <button
                onClick={() => goTo((index - 1 + reviews.length) % reviews.length, -1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex' }}
              >
                <ChevronLeft size={18} />
              </button>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
                {index + 1}/{reviews.length}
              </span>
              <button
                onClick={() => goTo((index + 1) % reviews.length, 1)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '4px', display: 'flex' }}
              >
                <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ position: 'relative', minHeight: '64px', padding: '0 var(--spacing-lg) var(--spacing-md)' }}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={review.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.25 }}
          >
            {/* Sterren + naam reviewer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} size={13} fill={review.score >= i ? '#f59e0b' : 'none'} color={review.score >= i ? '#f59e0b' : 'var(--color-border)'} />
                ))}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                <strong>{review.reviewer_naam || 'Anoniem'}</strong> over{' '}
                <span
                  onClick={() => navigate(`/spelers/${review.speler_naam.toLowerCase()}`)}
                  style={{ color: 'var(--color-primary)', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline', textDecorationColor: 'transparent', transition: 'text-decoration-color 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--color-primary)')}
                  onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
                >
                  {review.speler_naam}
                </span>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginLeft: 'auto' }}>
                {new Date(review.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
              </span>
            </div>

            {/* Commentaar */}
            {review.commentaar ? (
              <div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-primary)', fontStyle: 'italic', lineHeight: 1.4,
                  overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                  "{review.commentaar}"
                </p>
                <button
                  onClick={() => navigate(`/spelers/${review.speler_naam.toLowerCase()}`)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: '600', padding: '4px 0 0', display: 'block' }}
                >
                  Lees meer →
                </button>
              </div>
            ) : (
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text-tertiary)', fontStyle: 'italic' }}>
                Geen commentaar.
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon, title, player, value, subtitle, delay = 0, onPlayerClick }: {
  icon: React.ReactNode;
  title: string;
  player?: string;
  value: string | number;
  subtitle?: string;
  delay?: number;
  onPlayerClick?: (player: string) => void;
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }} 
    transition={{ delay }} 
    className="stat-card"
  >
    <div className="stat-card-header">
      <div>
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        {player && player !== '-' && onPlayerClick ? (
          <div
            onClick={() => onPlayerClick(player)}
            style={{ 
              fontSize: '1.125rem', 
              fontWeight: '600', 
              color: 'var(--color-primary)', 
              marginTop: 'var(--spacing-sm)',
              cursor: 'pointer',
              textDecoration: 'underline',
              textDecorationColor: 'transparent',
              transition: 'text-decoration-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--color-primary)')}
            onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
          >
            {player}
          </div>
        ) : player && (
          <div style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: 'var(--color-primary)', 
            marginTop: 'var(--spacing-sm)' 
          }}>
            {player}
          </div>
        )}
        {subtitle && <div className="stat-detail">{subtitle}</div>}
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  </motion.div>
);

export const HomePage = () => {
  const navigate = useNavigate();
  const { stats, loading: statsLoading } = useStats();
  const { wedstrijden, loading: matchesLoading } = useWedstrijden();
  const { seizoen } = useSeizoen();
  const samenvatting = seizoenSamenvatting(seizoen);

  if (statsLoading || matchesLoading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-2xl)' }}>
        <div className="animate-pulse">{COPY.LOADING}</div>
      </div>
    );
  }

  const handlePlayerClick = (naam: string) => {
    navigate(`/spelers/${naam.toLowerCase()}`);
  };

  // Top Scorer (alleen op goals)
  const topScorer = [...stats].sort((a, b) => b.doelpunten - a.doelpunten)[0] || { 
    speler_naam: '-', 
    doelpunten: 0, 
    aanwezig: 0 
  };
  
  // Goals per Game (min 3 wedstrijden)
  const goalsPerGameLeader = stats
    .filter(s => s.aanwezig >= 3)
    .map(s => ({ ...s, ratio: (s.doelpunten / s.aanwezig).toFixed(2) }))
    .sort((a, b) => parseFloat(b.ratio) - parseFloat(a.ratio))[0];
  
  // Meeste wedstrijden
  const maxGames = Math.max(...stats.map(s => s.aanwezig), 0);
  const mostGamesPlayers = stats
    .filter(s => s.aanwezig === maxGames)
    .map(s => s.speler_naam);
  
  // Totale stats - FIXED: gebruik alleen wedstrijden met een uitslag
  // Teamtotaal = spelersgoals + owngoals (alleen gespeelde, niet-forfait matchen)
  const owngoalsTotaal = wedstrijden
    .filter(w => isGespeeld(w.datum, w.uitslag) && !w.forfait && teltVoorStats(w.type))
    .reduce((sum, w) => sum + (w.owngoals ?? 0), 0);
  const totalGoals = stats.reduce((sum, s) => sum + s.doelpunten, 0) + owngoalsTotaal;
  
  // Filter op unieke wedstrijden die gespeeld zijn (hebben een uitslag en niet '-')
  const uniquePlayedMatches = wedstrijden.reduce((acc, current) => {
    // Alleen écht gespeelde, meetellende wedstrijden (geen oefenwedstrijden)
    if (!isGespeeld(current.datum, current.uitslag) || !teltVoorStats(current.type)) {
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
  
  const totalMatches = uniquePlayedMatches.length;
  const activePlayers = stats.filter(s => s.aanwezig > 0).length;

  return (
    <div>
      {/* Compacte match-day masthead — vervangt de grote hero */}
      <div style={{ background: 'var(--color-secondary)', color: '#fff', position: 'relative', overflow: 'hidden' }}>
        <div className="stripe-accent" />
        <div className="container" style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--spacing-sm)', padding: 'var(--spacing-md) var(--spacing-xl)' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '1.15rem', letterSpacing: '0.03em' }}>
            Match Centre
          </span>
          <span className="kicker" style={{ color: 'rgba(255,255,255,0.6)' }}>Seizoen {seizoen.replace('-', '–')}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="container" style={{ padding: 'var(--spacing-lg) var(--spacing-xl) var(--spacing-2xl)' }}>

        {/* PWA install banner (mobile only, dismissible) */}
        <InstallBanner />

        {/* NEXT + LAST MATCH — football eerst */}
        <NextMatchCard wedstrijden={wedstrijden} />

        {/* Seizoensgrafiek (editorieel) — enkel als het seizoen is afgesloten */}
        {samenvatting && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ position: 'relative', overflow: 'hidden', background: 'var(--color-secondary)', color: '#fff', padding: 'var(--spacing-lg)', marginTop: 'var(--spacing-2xl)' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '34%', background: 'var(--stripe-pattern)', opacity: 0.1, pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div className="kicker" style={{ color: 'rgba(255,255,255,0.55)', marginBottom: 'var(--spacing-sm)' }}>
                Seizoen {seizoen.replace('-', '–')} · Eindklassement
              </div>
              <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', lineHeight: 0.8, flexShrink: 0 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(4.5rem, 20vw, 8rem)' }}>{samenvatting.positie}</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'clamp(1.4rem, 6vw, 2.4rem)', color: 'var(--color-primary)', marginTop: '0.35em' }}>{samenvatting.positieSuffix}</span>
                </div>
                <div style={{ flex: 1, minWidth: 170 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.4rem, 5vw, 2rem)', lineHeight: 1 }}>
                    {samenvatting.medaille} {samenvatting.prestatie}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--spacing-lg)', flexWrap: 'wrap', marginTop: 'var(--spacing-md)' }}>
                    {[['Gewonnen', samenvatting.gewonnen], ['Gelijk', samenvatting.gelijk], ['Verloren', samenvatting.verloren], ['Doelsaldo', '+' + samenvatting.doelsaldo]].map(([l, v]) => (
                      <div key={l as string}>
                        <div className="scoreboard" style={{ fontSize: '1.9rem' }}>{v}</div>
                        <div className="kicker" style={{ color: 'rgba(255,255,255,0.5)' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {samenvatting.topscorerNaam && (
                <div style={{ marginTop: 'var(--spacing-md)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                  <span className="kicker" style={{ color: 'rgba(255,255,255,0.5)' }}>Topschutter</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: '1.2rem', color: 'var(--color-primary)' }}>{samenvatting.topscorerNaam}</span>
                  <span style={{ fontFamily: 'var(--font-cond)', color: 'rgba(255,255,255,0.7)' }}>{samenvatting.topscorerGoals} goals</span>
                </div>
              )}
              <div style={{ marginTop: 'var(--spacing-sm)', fontFamily: 'var(--font-cond)', color: 'rgba(255,255,255,0.6)', fontSize: '0.92rem' }}>
                {samenvatting.bedankt}
              </div>
            </div>
          </motion.div>
        )}
        
        {/* 01 — SEIZOEN IN CIJFERS (editorieel, geen kaders) */}
        <div className="section-head">
          <span className="section-index">01</span>
          <span className="section-title">Seizoen in cijfers</span>
          <span className="section-rule" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-lg)' }}>
          {([
            ['Gespeeld', totalMatches],
            [COPY.HOME_TOTAL_GOALS, totalGoals],
            [COPY.HOME_AVG_PER_MATCH, totalMatches > 0 ? (totalGoals / totalMatches).toFixed(1) : '0.0'],
            [COPY.HOME_ACTIVE_PLAYERS, activePlayers],
          ] as [string, string | number][]).map(([label, value]) => (
            <div key={label}>
              <div style={{ width: 24, height: 3, background: 'var(--color-primary)', marginBottom: 'var(--spacing-sm)' }} />
              <div className="scoreboard" style={{ fontSize: 'clamp(2.2rem, 9vw, 3rem)' }}>{value}</div>
              <div className="kicker" style={{ marginTop: '4px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* 02 — UITBLINKERS (editoriale rijen) */}
        <div className="section-head">
          <span className="section-index">02</span>
          <span className="section-title">Uitblinkers</span>
          <span className="section-rule" />
        </div>
        <div style={{ borderTop: '2px solid var(--color-text-primary)' }}>
          {[
            { label: 'Goals per match', player: goalsPerGameLeader?.speler_naam || '-', value: (goalsPerGameLeader?.ratio || '0.00') as string | number, sub: `${goalsPerGameLeader?.doelpunten || 0} in ${goalsPerGameLeader?.aanwezig || 0} matchen`, click: !!goalsPerGameLeader },
            { label: 'Meeste matchen', player: mostGamesPlayers.length <= 2 ? mostGamesPlayers.join(' & ') : `${mostGamesPlayers.length} spelers`, value: maxGames as string | number, sub: 'aanwezig', click: mostGamesPlayers.length === 1 },
          ].map(row => (
            <div
              key={row.label}
              onClick={row.click ? () => handlePlayerClick(row.player) : undefined}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) 0', borderBottom: '1px solid var(--color-line)', cursor: row.click ? 'pointer' : 'default' }}
            >
              <div style={{ minWidth: 0 }}>
                <div className="kicker">{row.label}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, textTransform: 'uppercase', fontSize: 'clamp(1.3rem, 5vw, 1.7rem)', lineHeight: 1.05, color: row.click ? 'var(--color-primary)' : 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.player}</div>
                <div style={{ fontFamily: 'var(--font-cond)', fontSize: '0.76rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.sub}</div>
              </div>
              <div className="scoreboard" style={{ fontSize: 'clamp(2.2rem, 9vw, 3rem)', flexShrink: 0 }}>{row.value}</div>
            </div>
          ))}
        </div>

        {/* 03 — TOPSCHUTTERS */}
        <div className="section-head">
          <span className="section-index">03</span>
          <span className="section-title">Topschutters</span>
          <span className="section-rule" />
        </div>
        <TopScorerTable stats={stats} />

        {/* 04 — UIT DE KLEEDKAMER (reviews) */}
        <div className="section-head">
          <span className="section-index">04</span>
          <span className="section-title">Uit de kleedkamer</span>
          <span className="section-rule" />
        </div>
        <ReviewsCarousel />
        
        {/* Compacte editoriale links (geen kaarten) */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-md) var(--spacing-xl)',
          marginTop: 'var(--spacing-2xl)', borderTop: '2px solid var(--color-text-primary)',
          paddingTop: 'var(--spacing-md)',
        }}>
          {[
            { text: COPY.HOME_CTA_FULL_RANKINGS, onClick: () => navigate('/statistieken') },
            { text: COPY.HOME_CTA_DETAILED_STATS, onClick: () => navigate('/statistieken/details') },
          ].map(l => (
            <button
              key={l.text}
              onClick={l.onClick}
              style={{
                fontFamily: 'var(--font-cond)', fontWeight: 600, textTransform: 'uppercase',
                letterSpacing: '0.06em', fontSize: '0.95rem', color: 'var(--color-text-primary)',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              }}
            >
              {l.text} <span style={{ color: 'var(--color-primary)' }}>→</span>
            </button>
          ))}
          <a
            href="https://www.facebook.com/profile.php?id=100067913117622"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-cond)', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.06em', fontSize: '0.95rem', color: 'var(--color-text-primary)',
              textDecoration: 'none',
            }}
          >
            {COPY.FACEBOOK_LINK_TEXT} <span style={{ color: 'var(--color-primary)' }}>→</span>
          </a>
        </div>
      </div>
    </div>
  );
};
