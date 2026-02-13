import { useState, FormEvent, ChangeEvent } from 'react';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { SPELERS } from '../../lib/types';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    setMessage(null);

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
      setMessage({ type: 'success', text: 'Wedstrijd succesvol opgeslagen!' });
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
      setMessage({ type: 'error', text: `Fout: ${result.error}` });
    }
    setLoading(false);
  };

  return (
    <div className="wedstrijd-form-container">
      {liveStats.aanwezig > 0 && (
        <div className="live-info">
          <div className="live-info-header">📌 <b>Wedstrijd overzicht</b></div>
          <div className="live-stats">
            <div>Aanwezigen: <span>{liveStats.aanwezig}</span></div>
            <div>Doelpunten totaal: <span>{liveStats.totalGoals}</span></div>
            <div>Corners: <span>{liveStats.totalCorners}</span></div>
            <div>Penalties: <span>{liveStats.totalPenalties}</span></div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="wedstrijd-form">
        <div className="form-row">
          <div className="form-group">
            <label>Datum *</label>
            <input
              type="date"
              value={datum}
              onChange={(e) => setDatum(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Uur *</label>
            <input
              type="time"
              value={tijd}
              onChange={(e) => setTijd(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Tegenstander *</label>
          <input
            type="text"
            value={uitploeg}
            onChange={(e) => setUitploeg(e.target.value)}
            placeholder="Naam tegenstander"
            required
          />
        </div>

        <div className="form-group">
          <label>Resultaat *</label>
          <input
            type="text"
            value={uitslag}
            onChange={(e) => setUitslag(e.target.value)}
            placeholder="bijv. 5-3"
            required
          />
        </div>

        <div className="spelers-table-container">
          <table className="spelers-table">
            <thead>
              <tr>
                <th>Speler</th>
                <th>Aanwezig</th>
                <th>Goals</th>
                <th>Penalty</th>
                <th>Corner</th>
              </tr>
            </thead>
            <tbody>
              {spelers.map((speler, index) => (
                <tr key={speler.naam}>
                  <td>{speler.naam}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={speler.aanwezig}
                      onChange={(e) => handleSpelerChange(index, 'aanwezig', e.target.checked)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={speler.doelpunten}
                      onChange={(e) => handleSpelerChange(index, 'doelpunten', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={speler.penalty}
                      onChange={(e) => handleSpelerChange(index, 'penalty', parseInt(e.target.value) || 0)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      value={speler.corner}
                      onChange={(e) => handleSpelerChange(index, 'corner', parseInt(e.target.value) || 0)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-group">
          <label>Opmerkingen</label>
          <textarea
            value={opmerkingen}
            onChange={(e) => setOpmerkingen(e.target.value)}
            rows={3}
            placeholder="Optioneel: bijzonderheden van de wedstrijd..."
          />
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.text}
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? 'Bezig met opslaan...' : '💾 Verzenden'}
        </button>
      </form>
    </div>
  );
};
