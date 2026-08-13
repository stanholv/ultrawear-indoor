import { Calendar } from 'lucide-react';
import { useSeizoen } from '../../hooks/useSeizoen';
import { HUIDIG_SEIZOEN } from '../../lib/seizoen';

/**
 * Compacte seizoenkiezer. Verschijnt pas zodra er meer dan één seizoen bestaat
 * (bv. nadat het nieuwe seizoen is gestart of oudere seizoenen zijn
 * geïmporteerd) — daarvoor is er niets te kiezen en blijft de balk verborgen.
 */
export const SeizoenSelector = () => {
  const { seizoen, setSeizoen, seizoenen } = useSeizoen();

  if (seizoenen.length <= 1) return null;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: '8px',
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '8px var(--spacing-xl)',
      }}
    >
      <Calendar size={16} style={{ color: 'var(--color-text-secondary)' }} />
      <label htmlFor="seizoen-select" style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
        Seizoen
      </label>
      <select
        id="seizoen-select"
        value={seizoen}
        onChange={(e) => setSeizoen(e.target.value)}
        style={{
          background: 'var(--color-bg-elevated)',
          color: 'var(--color-text-primary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '4px 10px',
          fontSize: '0.85rem',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {seizoenen.map((s) => (
          <option key={s} value={s}>
            {s}{s === HUIDIG_SEIZOEN ? ' (huidig)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
};
