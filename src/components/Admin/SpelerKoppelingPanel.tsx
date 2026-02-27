import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link2, Check, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { SPELERS } from '../../lib/types';

interface AccountInfo {
  id: string;
  full_name: string;
  email: string;
  speler_naam?: string;
}

export const SpelerKoppelingPanel = () => {
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email, speler_naam')
        .order('full_name');
      setAccounts(data || []);
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
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="card-header">
        <h2 className="card-title">
          <Link2 size={24} /> Account ↔ Speler Koppeling
        </h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          <Users size={14} style={{ display: 'inline', marginRight: '4px' }} />
          {accounts.length} accounts
        </div>
      </div>

      <div style={{ padding: 'var(--spacing-sm) 0' }}>
        {accounts.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
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
                padding: 'var(--spacing-md) var(--spacing-lg)',
                borderBottom: '1px solid var(--color-border)',
                flexWrap: 'wrap',
              }}
            >
              {/* Account info */}
              <div style={{ flex: 1, minWidth: '150px' }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{account.full_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{account.email}</div>
              </div>

              {/* Huidige koppeling indicator */}
              {account.speler_naam && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: 'rgba(16,185,129,0.1)', color: '#10b981',
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
                {SPELERS.map(speler => (
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
