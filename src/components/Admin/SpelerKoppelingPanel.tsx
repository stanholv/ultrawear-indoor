import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Link2, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { useSpelers } from '../../hooks/useSpelers';
import { SectieKop, HAIRLINE } from '../UI/editorial';

interface AccountInfo {
  id: string;
  full_name: string;
  email: string;
  speler_naam?: string;
}

export const SpelerKoppelingPanel = () => {
  const { alleNamen } = useSpelers();
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      // email is niet direct leesbaar; de admin-RPC controleert is_admin().
      const { data, error } = await supabase.rpc('admin_list_profiles');
      if (error) toast.error('Fout bij laden accounts: ' + error.message);
      const rows = (data as AccountInfo[]) || [];
      setAccounts([...rows].sort((a, b) => (a.full_name || '').localeCompare(b.full_name || '')));
      setLoading(false);
    };
    fetchAccounts();
  }, []);

  const handleKoppel = async (accountId: string, spelerNaam: string) => {
    setSaving(accountId);

    // Verwijder eerst eventuele bestaande koppeling voor deze speler
    if (spelerNaam) {
      await supabase
        .from('profiles')
        .update({ speler_naam: null })
        .eq('speler_naam', spelerNaam)
        .neq('id', accountId);
    }

    // Koppel het account aan de speler
    const { error } = await supabase
      .from('profiles')
      .update({ speler_naam: spelerNaam || null })
      .eq('id', accountId);

    if (error) {
      toast.error('Fout bij koppelen: ' + error.message);
    } else {
      toast.success(spelerNaam ? `${spelerNaam} gekoppeld! ✅` : 'Koppeling verwijderd');
      // Update lokale state
      setAccounts(prev => prev.map(a =>
        a.id === accountId ? { ...a, speler_naam: spelerNaam || undefined } : a
      ));
    }
    setSaving(null);
  };

  if (loading) {
    return <div className="animate-pulse" style={{ padding: 'var(--spacing-lg)' }}>Laden...</div>;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <SectieKop titel="Spelerkoppelingen" />
      <p className="kicker" style={{ margin: 'var(--spacing-xs) 0 var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '4px' }}>
        <Users size={13} /> {accounts.length} accounts
      </p>

      <div>
        {accounts.length === 0 ? (
          <div style={{ padding: 'var(--spacing-2xl) var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
            Geen accounts gevonden.
          </div>
        ) : (
          accounts.map((account) => (
            <div
              key={account.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                padding: 'var(--spacing-md) var(--spacing-xs)',
                borderBottom: HAIRLINE,
                flexWrap: 'wrap',
              }}
            >
              {/* Account info */}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>{account.full_name}</div>
                <div className="kicker" style={{ textTransform: 'none', letterSpacing: 0 }}>{account.email}</div>
              </div>

              {/* Huidige koppeling indicator */}
              {account.speler_naam && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(16,185,129,0.14)', color: '#10b981',
                  borderRadius: 'var(--radius-sm)', padding: '2px 8px',
                  fontSize: '0.75rem', fontWeight: '600',
                }}>
                  <Check size={12} /> {account.speler_naam}
                </div>
              )}

              {/* Dropdown */}
              <select
                className="form-input"
                value={account.speler_naam || ''}
                onChange={e => handleKoppel(account.id, e.target.value)}
                disabled={saving === account.id}
                style={{ width: 'auto', minWidth: '160px', fontSize: '0.875rem' }}
              >
                <option value="">-- Geen koppeling --</option>
                {alleNamen.map(speler => (
                  <option key={speler} value={speler}>{speler}</option>
                ))}
              </select>

              {saving === account.id && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Opslaan...</div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
