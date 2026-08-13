import { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Users, UserPlus, Trash2, AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useSpelers } from '../../hooks/useSpelers';

// ─── SELECTIE-/ROSTERBEHEER ──────────────────────────────────────────────────
// Beheert de `spelers`-tabel: toevoegen, activeren/deactiveren en verwijderen.
// Inactieve spelers verdwijnen uit het invoerformulier maar behouden hun
// historische statistieken.

export const SpelersBeheerPanel = () => {
  const { spelers, tabelAanwezig, addSpeler, setActief, verwijderSpeler, loading } = useSpelers();
  const [nieuweNaam, setNieuweNaam] = useState('');
  const [bezig, setBezig] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!nieuweNaam.trim()) return;
    setBezig(true);
    const res = await addSpeler(nieuweNaam);
    if (res.success) {
      toast.success(`${nieuweNaam.trim()} toegevoegd ✅`);
      setNieuweNaam('');
    } else {
      toast.error(`Toevoegen mislukt: ${res.error}`);
    }
    setBezig(false);
  };

  const handleToggle = async (id: string, actief: boolean) => {
    const res = await setActief(id, actief);
    if (!res.success) toast.error(res.error || 'Wijzigen mislukt');
  };

  const handleDelete = async (id: string) => {
    const res = await verwijderSpeler(id);
    if (res.success) toast.success('Speler verwijderd');
    else toast.error(res.error || 'Verwijderen mislukt');
    setDeleteConfirm(null);
  };

  if (loading) return <div className="animate-pulse" style={{ padding: 'var(--spacing-lg)' }}>Laden...</div>;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><Users size={22} /> Selectiebeheer</h2>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          {spelers.filter(s => s.actief).length} actief · {spelers.length} totaal
        </div>
      </div>

      {!tabelAanwezig && (
        <div style={{
          margin: '0 var(--spacing-lg) var(--spacing-md)',
          padding: 'var(--spacing-md)',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid #f59e0b',
          borderRadius: 'var(--radius-sm)',
          fontSize: '0.8rem',
          display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'flex-start',
        }}>
          <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            De <strong>spelers</strong>-tabel is nog niet gevonden. Dit is de ingebouwde terugvallijst
            (alleen-lezen). Voer de migratie <code>supabase-spelers.sql</code> uit om de selectie
            te kunnen beheren.
          </span>
        </div>
      )}

      {/* Nieuwe speler toevoegen */}
      <div style={{ display: 'flex', gap: 'var(--spacing-sm)', padding: '0 var(--spacing-lg) var(--spacing-md)', flexWrap: 'wrap' }}>
        <input
          className="form-input"
          value={nieuweNaam}
          onChange={e => setNieuweNaam(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="Naam nieuwe speler"
          disabled={!tabelAanwezig || bezig}
          style={{ flex: 1, minWidth: '160px' }}
        />
        <button
          onClick={handleAdd}
          className="btn btn-primary"
          disabled={!tabelAanwezig || bezig || !nieuweNaam.trim()}
          style={{ flexShrink: 0 }}
        >
          <UserPlus size={16} /> Toevoegen
        </button>
      </div>

      <div>
        {spelers.map((speler, i) => (
          <motion.div
            key={speler.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.02 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)',
              padding: 'var(--spacing-md) var(--spacing-lg)',
              borderBottom: i < spelers.length - 1 ? '1px solid var(--color-border)' : 'none',
              opacity: speler.actief ? 1 : 0.55,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.95rem', flex: 1 }}>{speler.naam}</span>

            <span style={{
              fontSize: '0.7rem', fontWeight: 700,
              color: speler.actief ? '#10b981' : 'var(--color-text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {speler.actief ? 'Actief' : 'Inactief'}
            </span>

            {/* Actief-toggle */}
            <button
              onClick={() => handleToggle(speler.id, !speler.actief)}
              className="btn"
              disabled={!tabelAanwezig}
              title={speler.actief ? 'Op inactief zetten' : 'Activeren'}
              style={{
                padding: '6px 10px', flexShrink: 0,
                color: speler.actief ? '#f59e0b' : '#10b981',
              }}
            >
              {speler.actief ? <X size={16} /> : <Check size={16} />}
            </button>

            {/* Verwijderen */}
            {deleteConfirm === speler.id ? (
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  onClick={() => handleDelete(speler.id)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}
                >Ja</button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ padding: '4px 10px', fontSize: '0.75rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                >Nee</button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteConfirm(speler.id)}
                className="btn"
                disabled={!tabelAanwezig}
                style={{ padding: '6px 10px', color: '#ef4444', flexShrink: 0 }}
                title="Speler verwijderen"
              >
                <Trash2 size={16} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      <p style={{ padding: 'var(--spacing-md) var(--spacing-lg)', margin: 0, fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        Op <strong>inactief</strong> zetten haalt een speler uit het invoerformulier, maar bewaart de
        statistieken. <strong>Verwijderen</strong> doe je alleen voor per ongeluk toegevoegde namen —
        het raakt bestaande stats (die op naam staan) niet.
      </p>
    </div>
  );
};
