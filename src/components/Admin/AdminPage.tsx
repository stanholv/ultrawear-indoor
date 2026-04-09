import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Shield, Link2, Star, Trash2, AlertTriangle, Users } from 'lucide-react';
import { SpelerKoppelingPanel } from './SpelerKoppelingPanel';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Review } from '../../lib/types';

type AdminTab = 'spelers' | 'reviews' | 'users';

const TABS: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
  { id: 'spelers', label: 'Speler Koppelingen', icon: <Link2 size={18} /> },
  { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
  { id: 'users', label: 'Gebruikers', icon: <Users size={18} /> },
];

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
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><Users size={22} /> Gebruikersbeheer</h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {users.length} gebruikers
        </div>
      </div>

      {users.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
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
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: i < users.length - 1 ? '1px solid var(--color-border)' : 'none',
                flexWrap: 'wrap',
              }}
            >
              {/* User info */}
              <div style={{ flex: 1, minWidth: '180px' }}>
                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{user.full_name || '(geen naam)'}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{user.email}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', marginTop: '2px' }}>
                  Geregistreerd: {new Date(user.created_at).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short', year: 'numeric' })}
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
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><Star size={22} /> Review Moderatie</h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {reviews.length} reviews totaal
        </div>
      </div>

      {/* Filter */}
      <div style={{ padding: '0 var(--spacing-lg) var(--spacing-md)' }}>
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
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
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
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: i < gefilterd.length - 1 ? '1px solid var(--color-border)' : 'none',
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

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('spelers');

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h1 className="card-title"><Shield size={28} /> Admin Dashboard</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Beheer spelers en reviews</p>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          borderBottom: '2px solid var(--color-border)',
          paddingBottom: 'var(--spacing-sm)', flexWrap: 'wrap',
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                background: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: activeTab === tab.id ? 'white' : 'var(--color-text-secondary)',
                border: activeTab === tab.id ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '0.9rem', transition: 'all var(--transition-fast)',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'spelers' && (
          <motion.div key="spelers" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <SpelerKoppelingPanel />
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ReviewModeratie />
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <UserBeheer />
          </motion.div>
        )}

      </motion.div>
    </div>
  );
};
