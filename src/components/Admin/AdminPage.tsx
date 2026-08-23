import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import { Shield, Link2, Star, Trash2, AlertTriangle, Users, Wallet, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { SpelerKoppelingPanel } from './SpelerKoppelingPanel';
import { SpelersBeheerPanel } from './SpelersBeheerPanel';
import { FinancienSection } from '../../pages/FinancienPage';
import { SectieKop, HAIRLINE } from '../UI/editorial';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Review } from '../../lib/types';

const StarDisplay = ({ score }: { score: number }) => (
  <div style={{ display: 'flex', gap: '2px' }}>
    {[1,2,3,4,5].map(i => (
      <Star key={i} size={14} fill={score >= i ? '#f59e0b' : 'none'} color={score >= i ? '#f59e0b' : 'var(--color-border)'} />
    ))}
  </div>
);

// ─── USER BEHEER ────────────────────────────────────────────────────────────

interface UserInfo {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'speler';
  speler_naam?: string;
  created_at: string;
}

const UserBeheer = () => {
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [savingRole, setSavingRole] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, speler_naam, created_at')
      .order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'speler') => {
    setSavingRole(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      toast.error('Fout bij wijzigen rol: ' + error.message);
    } else {
      toast.success(`Rol gewijzigd naar ${newRole} ✅`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    }
    setSavingRole(null);
  };

  const handleDelete = async (userId: string) => {
    // Verwijder het profiel uit de profiles tabel
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      toast.error('Fout bij verwijderen: ' + profileError.message);
      return;
    }

    toast.success('Profiel verwijderd ✅ — Verwijder de auth user ook in Supabase Dashboard → Authentication → Users');
    setUsers(prev => prev.filter(u => u.id !== userId));
    setDeleteConfirm(null);
  };

  if (loading) return <div className="animate-pulse" style={{ padding: 'var(--spacing-lg)' }}>Laden...</div>;

  return (
    <div>
      <SectieKop titel="Gebruikers" />
      <p className="kicker" style={{ margin: 'var(--spacing-xs) 0 var(--spacing-lg)' }}>{users.length} gebruikers</p>

      {users.length === 0 ? (
        <div style={{ padding: 'var(--spacing-2xl) var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
          Geen gebruikers gevonden.
        </div>
      ) : (
        <div>
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md) var(--spacing-xs)',
                borderBottom: HAIRLINE,
                flexWrap: 'wrap',
              }}
            >
              {/* User info */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>{user.full_name || '(geen naam)'}</div>
                <div className="kicker" style={{ textTransform: 'none', letterSpacing: 0 }}>{user.email}</div>
                <div className="kicker" style={{ marginTop: '2px' }}>
                  Sinds {new Date(user.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Gekoppelde speler badge */}
              {user.speler_naam && (
                <div style={{
                  background: 'rgba(16,185,129,0.12)', color: '#10b981',
                  borderRadius: 'var(--radius-sm)', padding: '2px 10px',
                  fontSize: '0.75rem', fontWeight: '600', flexShrink: 0,
                }}>
                  ⚽ {user.speler_naam}
                </div>
              )}

              {/* Rol dropdown */}
              <select
                className="form-input"
                value={user.role}
                onChange={e => handleRoleChange(user.id, e.target.value as 'admin' | 'speler')}
                disabled={savingRole === user.id}
                style={{
                  width: 'auto',
                  minWidth: '120px',
                  fontSize: '0.875rem',
                  color: user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  fontWeight: user.role === 'admin' ? '700' : '400',
                }}
              >
                <option value="speler">Speler</option>
                <option value="admin">Admin</option>
              </select>

              {savingRole === user.id && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', flexShrink: 0 }}>Opslaan...</div>
              )}

              {/* Verwijder knop */}
              {deleteConfirm === user.id ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <AlertTriangle size={12} /> Zeker verwijderen?
                  </div>
                  <div style={{
                    fontSize: '0.7rem',
                    color: 'var(--color-text-secondary)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '6px 8px',
                    maxWidth: '220px',
                    lineHeight: 1.4,
                    textAlign: 'left',
                  }}>
                    ⚠️ Na het verwijderen moet je de gebruiker ook handmatig verwijderen in <strong>Supabase Dashboard → Authentication → Users</strong>, anders kan die persoon nog steeds inloggen.
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleDelete(user.id)}
                      style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600' }}
                    >Ja, verwijderen</button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                    >Annuleren</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setDeleteConfirm(user.id)}
                  className="btn"
                  style={{ padding: '6px 10px', color: '#ef4444', flexShrink: 0 }}
                  title="Gebruiker verwijderen"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── REVIEW MODERATIE ────────────────────────────────────────────────────────

const ReviewModeratie = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('');

  const fetchReviews = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });
    setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      toast.error('Fout bij verwijderen');
    } else {
      toast.success('Review verwijderd');
      setReviews(prev => prev.filter(r => r.id !== id));
      setDeleteConfirm(null);
    }
  };

  const spelers = [...new Set(reviews.map(r => r.speler_naam))].sort();
  const gefilterd = filter ? reviews.filter(r => r.speler_naam === filter) : reviews;

  if (loading) return <div className="animate-pulse" style={{ padding: 'var(--spacing-lg)' }}>Laden...</div>;

  return (
    <div>
      <SectieKop titel="Reviews" />
      <p className="kicker" style={{ margin: 'var(--spacing-xs) 0 var(--spacing-lg)' }}>{reviews.length} reviews totaal</p>

      {/* Filter */}
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <select
          className="form-input"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{ width: 'auto', minWidth: '180px', fontSize: '0.875rem' }}
        >
          <option value="">Alle spelers</option>
          {spelers.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {gefilterd.length === 0 ? (
        <div style={{ padding: 'var(--spacing-2xl) var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
          Geen reviews gevonden.
        </div>
      ) : (
        <div>
          {gefilterd.map((review, i) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: 'var(--spacing-md) var(--spacing-xs)',
                borderBottom: HAIRLINE,
                gap: 'var(--spacing-md)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1, minWidth: '200px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <StarDisplay score={review.score} />
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{review.reviewer_naam || 'Anoniem'}</span>
                  <span style={{
                    background: 'var(--color-primary)', color: 'white',
                    borderRadius: 'var(--radius-sm)', padding: '1px 8px',
                    fontSize: '0.75rem', fontWeight: '600',
                  }}>
                    {review.speler_naam}
                  </span>
                </div>
                {review.commentaar && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                    "{review.commentaar}"
                  </p>
                )}
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: '4px' }}>
                  {new Date(review.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              {/* Verwijder actie */}
              <div>
                {deleteConfirm === review.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} /> Zeker verwijderen?
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleDelete(review.id)}
                        style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: '600' }}
                      >Ja</button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                      >Nee</button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(review.id)}
                    className="btn"
                    style={{ padding: '6px 10px', color: '#ef4444' }}
                    title="Review verwijderen"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── CONTROLEPANEEL ──────────────────────────────────────────────────────────
// Redactionele hub (geen kaartraster): genummerde secties met een rode rule,
// en per sectie een lijst van instellingen. Kiezen opent het paneel; een
// "terug"-link keert naar het overzicht. Financiën en Wedstrijd invoeren wonen
// hier ook, zodat de hoofdnavigatie maar één Admin-ingang heeft.

type SectieId = 'selectie' | 'koppelingen' | 'gebruikers' | 'financien' | 'reviews';

interface HubItem {
  id: SectieId | 'invoeren';
  label: string;
  omschrijving: string;
  icon: React.ReactNode;
  href?: string; // navigeert i.p.v. een paneel te openen
}

const GROEPEN: { index: string; titel: string; items: HubItem[] }[] = [
  {
    index: '01', titel: 'Beheer', items: [
      { id: 'selectie', label: 'Selectie', omschrijving: 'Actieve spelers in het rooster', icon: <Users size={18} /> },
      { id: 'koppelingen', label: 'Spelerkoppelingen', omschrijving: 'Accounts aan spelers koppelen', icon: <Link2 size={18} /> },
      { id: 'gebruikers', label: 'Gebruikers', omschrijving: 'Rollen en toegang beheren', icon: <Shield size={18} /> },
    ],
  },
  {
    index: '02', titel: 'Financieel', items: [
      { id: 'financien', label: 'Financiën', omschrijving: 'Leden, inschrijvingen en kasboek', icon: <Wallet size={18} /> },
    ],
  },
  {
    index: '03', titel: 'Content', items: [
      { id: 'reviews', label: 'Reviews', omschrijving: 'Reviews modereren', icon: <Star size={18} /> },
      { id: 'invoeren', label: 'Wedstrijd invoeren', omschrijving: 'Uitslag en statistieken toevoegen', icon: <Calendar size={18} />, href: '/wedstrijd-invoeren' },
    ],
  },
];

const SECTIE_LABEL: Record<SectieId, string> = {
  selectie: 'Selectie',
  koppelingen: 'Spelerkoppelingen',
  gebruikers: 'Gebruikers',
  financien: 'Financiën',
  reviews: 'Reviews',
};

const HubRij = ({ item, onClick }: { item: HubItem; onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
      width: '100%', textAlign: 'left', cursor: 'pointer',
      background: 'transparent', border: 'none',
      borderBottom: '1px solid var(--color-border)',
      padding: 'var(--spacing-md) var(--spacing-xs)',
      color: 'var(--color-text-primary)', transition: 'background var(--transition-fast)',
    }}
    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface)')}
    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
  >
    <span style={{ color: 'var(--color-primary)', display: 'flex' }}>{item.icon}</span>
    <span style={{ flex: 1 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block' }}>
        {item.label}
      </span>
      <span className="kicker" style={{ textTransform: 'none', letterSpacing: 0 }}>{item.omschrijving}</span>
    </span>
    <ChevronRight size={18} style={{ color: 'var(--color-text-tertiary)' }} />
  </button>
);

export const AdminPage = () => {
  const [actief, setActief] = useState<SectieId | null>(null);
  const navigate = useNavigate();

  const openen = (item: HubItem) => {
    if (item.href) navigate(item.href);
    else setActief(item.id as SectieId);
  };

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      {actief ? (
        <motion.div key={actief} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={() => setActief(null)}
            className="kicker"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}
          >
            <ArrowLeft size={14} /> Alle instellingen
          </button>

          <div className="page-header">
            <h1 className="page-title">{SECTIE_LABEL[actief]}</h1>
          </div>

          {actief === 'selectie' && <SpelersBeheerPanel />}
          {actief === 'koppelingen' && <SpelerKoppelingPanel />}
          {actief === 'gebruikers' && <UserBeheer />}
          {actief === 'financien' && <FinancienSection />}
          {actief === 'reviews' && <ReviewModeratie />}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="page-header">
            <h1 className="page-title"><Shield size={32} /> Admin</h1>
            <p className="page-subtitle">Controlepaneel</p>
          </div>

          {GROEPEN.map((groep) => (
            <section key={groep.index}>
              <div className="section-head">
                <span className="section-index">{groep.index}</span>
                <span className="section-title">{groep.titel}</span>
                <span className="section-rule" />
              </div>
              <div>
                {groep.items.map((item) => (
                  <HubRij key={item.id} item={item} onClick={() => openen(item)} />
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      )}
    </div>
  );
};
