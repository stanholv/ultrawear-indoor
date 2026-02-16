import { useState, FormEvent, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Users, Save, AlertCircle, Trophy, Info } from 'lucide-react';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { SPELERS, WedstrijdFormData } from '../../lib/types';
import { toast } from 'sonner';
import { NumberInput } from '../UI/NumberInput';
import { COPY } from '../../lib/copy';

interface SpelerInput {
  naam: string;
  aanwezig: boolean;
  doelpunten: number;
  penalty: number;
  corner: number;
}

export const WedstrijdForm = () => {
  const { wedstrijden, createWedstrijd, loading: wedstrijdenLoading } = useWedstrijden();
  const [matchType, setMatchType] = useState<'competitie' | 'beker' | 'oefenwedstrijd'>('competitie');
  
  // Twee modes: maak nieuwe wedstrijd OF vul bestaande in
  const [mode, setMode] = useState<'create' | 'fill'>('fill');
  const [selectedWedstrijdId, setSelectedWedstrijdId] = useState('');
  
  const [datum, setDatum] = useState('');
  const [tijd, setTijd] = useState('');
  const [thuisploeg, setThuisploeg] = useState('');
  const [uitploeg, setUitploeg] = useState('');
  const [thuisGoals, setThuisGoals] = useState('');
  const [uitGoals, setUitGoals] = useState('');
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

  // Filter wedstrijden zonder uitslag EN verwijder duplicaten op basis van datum+tijd+tegenstander
  const uniqueWedstrijden = wedstrijden.reduce((acc, current) => {
    // Maak een unieke key voor deze wedstrijd
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

  // FIXED: Filter alleen wedstrijden zonder uitslag, gesorteerd van oud naar nieuw
  const openWedstrijden = uniqueWedstrijden
    .filter(w => !w.uitslag || w.uitslag === '-')
    .sort((a, b) => {
      // Sorteer van OUD naar NIEUW voor chronologische weergave
      const dateA = new Date(`${a.datum}T${a.tijd}`);
      const dateB = new Date(`${b.datum}T${b.tijd}`);
      return dateA.getTime() - dateB.getTime();
    });
  
  // Wedstrijden die al ingevuld zijn
  const ingevuldeWedstrijden = uniqueWedstrijden.filter(w => w.uitslag && w.uitslag !== '-');
  
  // FIXED: Suggest closest match (past of toekomst) - kies de dichtstbijzijnde wedstrijd bij huidige tijd
  useEffect(() => {
    if (openWedstrijden.length > 0 && !selectedWedstrijdId && mode === 'fill') {
      const now = new Date();
      
      // Zoek eerst een wedstrijd die nog moet komen (toekomstige wedstrijden)
      const upcomingMatches = openWedstrijden
        .filter(w => {
          const matchDateTime = new Date(`${w.datum}T${w.tijd}`);
          return matchDateTime >= now;
        })
        .sort((a, b) => {
          const dateA = new Date(`${a.datum}T${a.tijd}`);
          const dateB = new Date(`${b.datum}T${b.tijd}`);
          return dateA.getTime() - dateB.getTime();
        });
      
      // Als er toekomstige wedstrijden zijn, kies de eerste (dichtstbijzijnde)
      let suggestedMatch = upcomingMatches[0];
      
      // Als er geen toekomstige wedstrijden zijn, neem de meest recente wedstrijd uit het verleden
      if (!suggestedMatch && openWedstrijden.length > 0) {
        const pastMatches = openWedstrijden
          .filter(w => {
            const matchDateTime = new Date(`${w.datum}T${w.tijd}`);
            return matchDateTime < now;
          })
          .sort((a, b) => {
            const dateA = new Date(`${a.datum}T${a.tijd}`);
            const dateB = new Date(`${b.datum}T${b.tijd}`);
            return dateB.getTime() - dateA.getTime(); // Sorteer reversed (meest recent eerst)
          });
        
        suggestedMatch = pastMatches[0];
      }
      
      // Als er helemaal geen wedstrijden zijn gevonden, neem gewoon de eerste
      if (!suggestedMatch && openWedstrijden.length > 0) {
        suggestedMatch = openWedstrijden[0];
      }
      
      // Pre-fill het formulier met de gesuggereerde wedstrijd
      if (suggestedMatch) {
        setSelectedWedstrijdId(suggestedMatch.id);
        setDatum(suggestedMatch.datum);
        setTijd(suggestedMatch.tijd);
        setThuisploeg(suggestedMatch.thuisploeg);
        setUitploeg(suggestedMatch.uitploeg);
        setMatchType(suggestedMatch.type || 'competitie');
      }
    }
  }, [openWedstrijden, selectedWedstrijdId, mode]);

  const handleWedstrijdSelect = (wedstrijdId: string) => {
    setSelectedWedstrijdId(wedstrijdId);
    const wedstrijd = wedstrijden.find(w => w.id === wedstrijdId);
    if (wedstrijd) {
      setDatum(wedstrijd.datum);
      setTijd(wedstrijd.tijd);
      setThuisploeg(wedstrijd.thuisploeg);
      setUitploeg(wedstrijd.uitploeg);
      setMatchType(wedstrijd.type || 'competitie');
      
      // Check of deze wedstrijd al ingevuld is
      const bestaandeData = ingevuldeWedstrijden.find(w => 
        w.datum === wedstrijd.datum && 
        w.tijd === wedstrijd.tijd && 
        w.thuisploeg === wedstrijd.thuisploeg &&
        w.uitploeg === wedstrijd.uitploeg
      );
      
      if (bestaandeData && bestaandeData.uitslag) {
        // Parse de bestaande uitslag
        const [thuis, uit] = bestaandeData.uitslag.split('-');
        setThuisGoals(thuis);
        setUitGoals(uit);
        toast.info('Deze wedstrijd is al eerder ingevuld. Je kunt de gegevens aanpassen.');
      } else {
        setThuisGoals('');
        setUitGoals('');
      }
    }
  };

  const handleSpelerChange = (index: number, field: keyof SpelerInput, value: any) => {
    const newSpelers = [...spelers];
    newSpelers[index] = { ...newSpelers[index], [field]: value };
    
    // Auto-check aanwezig als goals/penalties/corners > 0
    if ((field === 'doelpunten' || field === 'penalty' || field === 'corner') && value > 0) {
      newSpelers[index].aanwezig = true;
    }
    
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
  
  // Bereken wedstrijdresultaat
  const isUltrawearthuis = thuisploeg === 'Ultrawear Indoor';
  const ultraWearGoals = isUltrawearthuis ? parseInt(thuisGoals) || 0 : parseInt(uitGoals) || 0;
  const tegenstanderGoals = isUltrawearthuis ? parseInt(uitGoals) || 0 : parseInt(thuisGoals) || 0;
  
  let resultaat = '';
  let punten = 0;
  if (thuisGoals && uitGoals) {
    if (ultraWearGoals > tegenstanderGoals) {
      resultaat = 'Gewonnen 🎉';
      punten = 3;
    } else if (ultraWearGoals === tegenstanderGoals) {
      resultaat = 'Gelijkspel';
      punten = 1;
    } else {
      resultaat = 'Verloren';
      punten = 0;
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!datum || !tijd || (!thuisploeg && !uitploeg)) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    setLoading(true);
    try {
      const uitslag = thuisGoals && uitGoals ? `${thuisGoals}-${uitGoals}` : '';
      
      const formData: WedstrijdFormData = {
        datum,
        tijd,
        thuisploeg: mode === 'create' ? 'Ultrawear Indoor' : thuisploeg,
        uitploeg: mode === 'create' ? uitploeg : uitploeg,
        uitslag,
        type: matchType,
        opmerkingen,
        spelers: spelers.map(s => ({
          naam: s.naam,
          aanwezig: s.aanwezig,
          doelpunten: s.doelpunten,
          penalty: s.penalty,
          corner: s.corner
        }))
      };

      const result = await createWedstrijd(formData);
      if (result.success) {
        toast.success(COPY.FORM_SUCCESS);
        // Reset form
        setDatum('');
        setTijd('');
        setThuisploeg('');
        setUitploeg('');
        setThuisGoals('');
        setUitGoals('');
        setOpmerkingen('');
        setSelectedWedstrijdId('');
        setSpelers(SPELERS.map(naam => ({
          naam,
          aanwezig: false,
          doelpunten: 0,
          penalty: 0,
          corner: 0,
        })));
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(`${COPY.FORM_ERROR}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (wedstrijdenLoading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="animate-pulse">{COPY.LOADING}</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="card-header">
          <h2 className="card-title">{COPY.FORM_TITLE}</h2>
          <p className="page-subtitle">{COPY.FORM_SUBTITLE}</p>
        </div>

        {/* Mode Selector */}
        <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--color-border)' }}>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                checked={mode === 'fill'}
                onChange={() => setMode('fill')}
              />
              <span className="radio-text">📝 Bestaande Wedstrijd Invullen</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                name="mode"
                checked={mode === 'create'}
                onChange={() => setMode('create')}
              />
              <span className="radio-text">➕ Nieuwe Wedstrijd Aanmaken</span>
            </label>
          </div>
        </div>

        {/* Live Stats Preview */}
        {liveStats.aanwezig > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="card glass"
            style={{ 
              margin: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg)',
              borderLeft: '4px solid var(--color-primary)',
              background: 'var(--color-surface)'
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
              {COPY.FORM_LIVE_STATS_TITLE}
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: 'var(--spacing-lg)' 
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {COPY.FORM_LIVE_PRESENT}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-success)' }}>
                  {liveStats.aanwezig}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {COPY.FORM_LIVE_GOALS}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.totalGoals}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {COPY.FORM_LIVE_CORNERS}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.totalCorners}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                  {COPY.FORM_LIVE_PENALTIES}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-primary)' }}>
                  {liveStats.totalPenalties}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Resultaat Preview */}
        {resultaat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card glass"
            style={{ 
              margin: 'var(--spacing-lg)',
              padding: 'var(--spacing-lg)',
              background: resultaat.includes('Gewonnen') ? 'rgba(16, 185, 129, 0.1)' : 
                          resultaat.includes('Gelijkspel') ? 'rgba(245, 158, 11, 0.1)' :
                          'rgba(239, 68, 68, 0.1)',
              border: `2px solid ${resultaat.includes('Gewonnen') ? '#10b981' : 
                                    resultaat.includes('Gelijkspel') ? '#f59e0b' : 
                                    '#ef4444'}`
            }}
          >
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--spacing-md)' 
            }}>
              <div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Verwacht Resultaat
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {resultaat}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '4px' }}>
                  Punten
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                  {punten}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
          
          {/* Wedstrijd Selector (alleen in fill mode) */}
          {mode === 'fill' && (
            <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label className="form-label">
                <Trophy size={16} /> {COPY.LABEL_WEDSTRIJD} *
              </label>
              
              {openWedstrijden.length === 0 ? (
                <div style={{
                  padding: 'var(--spacing-lg)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  color: 'var(--color-text-secondary)'
                }}>
                  <Info size={24} style={{ marginBottom: 'var(--spacing-sm)' }} />
                  <p style={{ margin: 0 }}>Geen open wedstrijden beschikbaar.</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.875rem' }}>
                    Schakel over naar "Nieuwe Wedstrijd Aanmaken" om een wedstrijd toe te voegen.
                  </p>
                </div>
              ) : (
                <>
                  <select
                    className="form-input"
                    value={selectedWedstrijdId}
                    onChange={(e) => handleWedstrijdSelect(e.target.value)}
                    required
                  >
                    <option value="">{COPY.LABEL_SELECT_MATCH}</option>
                    {openWedstrijden.map(match => {
                      const matchDateTime = new Date(`${match.datum}T${match.tijd}`);
                      const now = new Date();
                      const isPast = matchDateTime < now;
                      const isThuis = match.thuisploeg === 'Ultrawear Indoor';
                      const tegenstander = isThuis ? match.uitploeg : match.thuisploeg;
                      
                      return (
                        <option key={match.id} value={match.id}>
                          {new Date(match.datum).toLocaleDateString('nl-BE')} {match.tijd} - {isThuis ? 'THUIS' : 'UIT'} vs {tegenstander} {isPast ? '(gespeeld)' : ''}
                        </option>
                      );
                    })}
                  </select>
                  
                  {ingevuldeWedstrijden.find(w => 
                    w.datum === datum && 
                    w.tijd === tijd && 
                    w.thuisploeg === thuisploeg &&
                    w.uitploeg === uitploeg
                  ) && (
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm)',
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid #f59e0b',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      gap: 'var(--spacing-sm)',
                      fontSize: '0.875rem'
                    }}>
                      <Info size={16} color="#f59e0b" />
                      <span>Deze wedstrijd is al eerder ingevuld. De bestaande data wordt hieronder getoond.</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Type Selector (alleen in create mode) */}
          {mode === 'create' && (
            <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
              <label className="form-label">
                <Trophy size={16} /> {COPY.LABEL_TYPE} *
              </label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="competitie"
                    checked={matchType === 'competitie'}
                    onChange={() => setMatchType('competitie')}
                  />
                  <span className="radio-text">
                    {COPY.TYPE_COMPETITIE_ICON} {COPY.TYPE_COMPETITIE}
                  </span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="type"
                    value="beker"
                    checked={matchType === 'beker'}
                    onChange={() => setMatchType('beker')}
                  />
                  <span className="radio-text">
                    {COPY.TYPE_BEKER_ICON} {COPY.TYPE_BEKER}
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Wedstrijd Details */}
          {(mode === 'create' || (mode === 'fill' && selectedWedstrijdId)) && (
            <>
              <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: 'var(--spacing-xl)' }}>
                <div className="form-group">
                  <label className="form-label">
                    <Calendar size={16} /> {COPY.LABEL_DATUM} *
                  </label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={datum} 
                    onChange={e => setDatum(e.target.value)} 
                    disabled={mode === 'fill'}
                    required 
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    <Clock size={16} /> {COPY.LABEL_TIJD} *
                  </label>
                  <input 
                    type="time" 
                    className="form-input" 
                    value={tijd} 
                    onChange={e => setTijd(e.target.value)} 
                    disabled={mode === 'fill'}
                    required 
                  />
                </div>
                
                {mode === 'create' && (
                  <div className="form-group">
                    <label className="form-label">{COPY.LABEL_TEGENSTANDER} *</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={uitploeg} 
                      onChange={e => setUitploeg(e.target.value)} 
                      placeholder={COPY.LABEL_TEGENSTANDER_PLACEHOLDER}
                      required 
                    />
                  </div>
                )}
              </div>
              
              {/* Uitslag sectie - NIEUW met aparte velden voor thuis en uit */}
              {mode === 'fill' && thuisploeg && uitploeg && (
                <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                  <h3 className="form-label" style={{ marginBottom: 'var(--spacing-md)' }}>
                    <Trophy size={16} /> Wedstrijduitslag
                  </h3>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr auto 1fr', 
                    gap: 'var(--spacing-md)', 
                    alignItems: 'center',
                    padding: 'var(--spacing-lg)',
                    background: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)'
                  }}>
                    <div>
                      <label className="form-label" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        {thuisploeg}
                        {thuisploeg === 'Ultrawear Indoor' && <span style={{ marginLeft: '8px' }}>🏠</span>}
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        max="30"
                        className="form-input" 
                        value={thuisGoals} 
                        onChange={e => setThuisGoals(e.target.value)} 
                        placeholder="0"
                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '700' }}
                      />
                    </div>
                    
                    <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--color-text-secondary)' }}>
                      -
                    </div>
                    
                    <div>
                      <label className="form-label" style={{ marginBottom: 'var(--spacing-sm)' }}>
                        {uitploeg}
                        {uitploeg === 'Ultrawear Indoor' && <span style={{ marginLeft: '8px' }}>✈️</span>}
                      </label>
                      <input 
                        type="number" 
                        min="0"
                        max="30"
                        className="form-input" 
                        value={uitGoals} 
                        onChange={e => setUitGoals(e.target.value)} 
                        placeholder="0"
                        style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: '700' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Spelers Tabel */}
              <div style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h3 className="form-label" style={{ marginBottom: 'var(--spacing-md)' }}>
                  <Users size={16} /> {COPY.FORM_SECTION_PLAYERS}
                </h3>
                <div className="table-container">
                  <table className="stats-table">
                    <thead>
                      <tr>
                        <th>{COPY.LABEL_SPELER}</th>
                        <th style={{ textAlign: 'center' }}>{COPY.LABEL_AANWEZIG}</th>
                        <th style={{ textAlign: 'center' }}>{COPY.LABEL_GOALS}</th>
                        <th style={{ textAlign: 'center' }}>{COPY.LABEL_PENALTIES}</th>
                        <th style={{ textAlign: 'center' }}>{COPY.LABEL_CORNERS}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {spelers.map((speler, index) => (
                        <tr key={speler.naam}>
                          <td style={{ fontWeight: '600' }}>{speler.naam}</td>
                          <td style={{ textAlign: 'center' }}>
                            <input 
                              type="checkbox" 
                              checked={speler.aanwezig} 
                              onChange={e => handleSpelerChange(index, 'aanwezig', e.target.checked)}
                              style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <NumberInput 
                              value={speler.doelpunten} 
                              onChange={val => handleSpelerChange(index, 'doelpunten', val)}
                              max={20}
                              disabled={!speler.aanwezig}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <NumberInput 
                              value={speler.penalty} 
                              onChange={val => handleSpelerChange(index, 'penalty', val)}
                              max={10}
                              disabled={!speler.aanwezig}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <NumberInput 
                              value={speler.corner} 
                              onChange={val => handleSpelerChange(index, 'corner', val)}
                              max={20}
                              disabled={!speler.aanwezig}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Opmerkingen */}
              <div className="form-group">
                <label className="form-label">
                  <AlertCircle size={16} /> {COPY.LABEL_OPMERKINGEN}
                </label>
                <textarea 
                  className="form-textarea" 
                  value={opmerkingen} 
                  onChange={e => setOpmerkingen(e.target.value)} 
                  placeholder={COPY.LABEL_OPMERKINGEN_PLACEHOLDER}
                  rows={3} 
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading} 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: 'var(--spacing-xl)' }}
              >
                <Save size={20} /> 
                {loading ? COPY.FORM_SAVING : COPY.BTN_SAVE_MATCH}
              </button>
            </>
          )}
        </form>
      </motion.div>
    </div>
  );
};
