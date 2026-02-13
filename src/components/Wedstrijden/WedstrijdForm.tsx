import { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Trophy, Save, AlertCircle } from 'lucide-react';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { SPELERS } from '../../lib/types';
import { toast } from 'sonner';

interface SpelerInput {
  naam: string;
  aanwezig: boolean;
  doelpunten: number;
  penalty: number;
  corner: number;
}

export const WedstrijdForm = () => {
  const { createWedstrijd } = useWedstrijden();
  const [datum, setDatum] = useState('');
  const [tijd, setTijd] = useState('');
  const [uitploeg, setUitploeg] = useState('');
  const [uitslag, setUitslag] = useState('');
  const [opmerkingen, setOpmerkingen] = useState('');
  const [spelers, setSpelers] = useState<SpelerInput[]>(
    SPELERS.map(naam => ({
      naam,
      aanwezig: false,
      doelpunten: 0,
      penalty: 0,
      corner: 0,
    }))
  );
  const [loading, setLoading] = useState(false);

  const handleSpelerChange = (index: number, field: keyof SpelerInput, value: boolean | number) => {
    const newSpelers = [...spelers];
    newSpelers[index] = { ...newSpelers[index], [field]: value };
    setSpelers(newSpelers);
  };

  const calculateLiveStats = () => {
    const aanwezig = spelers.filter(s => s.aanwezig).length;
    const totalGoals = spelers.reduce((sum, s) => sum + s.doelpunten, 0);
    const totalCorners = spelers.reduce((sum, s) => sum + s.corner, 0);
    const totalPenalties = spelers.reduce((sum, s) => sum + s.penalty, 0);
    return { aanwezig, totalGoals, totalCorners, totalPenalties };
  };

  const liveStats = calculateLiveStats();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await createWedstrijd({
      datum,
      tijd,
      thuisploeg: 'Ultrawear Indoor',
      uitploeg,
      uitslag,
      opmerkingen,
      spelers,
    });

    if (result.success) {
      toast.success('Wedstrijd succesvol opgeslagen! 🎉');
      // Reset form
      setDatum('');
      setTijd('');
      setUitploeg('');
      setUitslag('');
      setOpmerkingen('');
      setSpelers(SPELERS.map(naam => ({
        naam,
        aanwezig: false,
        doelpunten: 0,
        penalty: 0,
        corner: 0,
      })));
    } else {
      toast.error(`Fout: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <div className="main-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="page-header">
          <h1 className="page-title">⚽ Nieuwe Wedstrijd Invoeren</h1>
          <p className="page-subtitle">Vul de wedstrijdgegevens en spelerstatistieken in</p>
        </div>

        {liveStats.aanwezig > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card glass"
            style={{ 
              marginBottom: 'var(--spacing-xl)',
              padding: 'var(--spacing-lg)',
              borderLeft: '4px solid var(--color-primary)'
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-sm)',
              marginBottom: 'var(--spacing-md)',
              fontWeight: '600'
            }}>
              <Trophy size={20} color="var(--color-primary)" />
              Wedstrijd Overzicht
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: 'var(--spacing-lg)' 
            }}>
              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Aanwezigen
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.aanwezig}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Doelpunten
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.totalGoals}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Corners
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.totalCorners}
                </div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  Penalties
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.totalPenalties}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="card">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                <Calendar size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Datum *
              </label>
              <input
                type="date"
                className="form-input"
                value={datum}
                onChange={(e) => setDatum(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                <Clock size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                Tijd *
              </label>
              <input
                type="time"
                className="form-input"
                value={tijd}
                onChange={(e) => setTijd(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <Users size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Tegenstander *
            </label>
            <input
              type="text"
              className="form-input"
              value={uitploeg}
              onChange={(e) => setUitploeg(e.target.value)}
              placeholder="Naam tegenstander"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <Trophy size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Resultaat *
            </label>
            <input
              type="text"
              className="form-input"
              value={uitslag}
              onChange={(e) => setUitslag(e.target.value)}
              placeholder="bijv. 5-3"
              required
            />
          </div>

          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <h3 style={{ 
              marginBottom: 'var(--spacing-lg)',
              fontSize: '1.125rem',
              fontWeight: '600',
              color: 'var(--color-text-primary)'
            }}>
              Speler Statistieken
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Speler</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Aanwezig</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Goals</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Penalty</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>Corner</th>
                  </tr>
                </thead>
                <tbody>
                  {spelers.map((speler, index) => (
                    <tr key={speler.naam}>
                      <td>
                        <div style={{ fontWeight: '500' }}>{speler.naam}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={speler.aanwezig}
                          onChange={(e) => handleSpelerChange(index, 'aanwezig', e.target.checked)}
                          style={{ 
                            width: '20px', 
                            height: '20px', 
                            cursor: 'pointer',
                            accentColor: 'var(--color-primary)'
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={speler.doelpunten}
                          onChange={(e) => handleSpelerChange(index, 'doelpunten', parseInt(e.target.value) || 0)}
                          className="form-input"
                          style={{ 
                            width: '60px', 
                            textAlign: 'center',
                            margin: '0 auto'
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={speler.penalty}
                          onChange={(e) => handleSpelerChange(index, 'penalty', parseInt(e.target.value) || 0)}
                          className="form-input"
                          style={{ 
                            width: '60px', 
                            textAlign: 'center',
                            margin: '0 auto'
                          }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="number"
                          min="0"
                          value={speler.corner}
                          onChange={(e) => handleSpelerChange(index, 'corner', parseInt(e.target.value) || 0)}
                          className="form-input"
                          style={{ 
                            width: '60px', 
                            textAlign: 'center',
                            margin: '0 auto'
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 'var(--spacing-xl)' }}>
            <label className="form-label">
              <AlertCircle size={16} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
              Opmerkingen
            </label>
            <textarea
              className="form-textarea"
              value={opmerkingen}
              onChange={(e) => setOpmerkingen(e.target.value)}
              rows={3}
              placeholder="Optioneel: bijzonderheden van de wedstrijd..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 'var(--spacing-xl)' }}
          >
            {loading ? (
              'Opslaan...'
            ) : (
              <>
                <Save size={20} />
                Wedstrijd Opslaan
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
