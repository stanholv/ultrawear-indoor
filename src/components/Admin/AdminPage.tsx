import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Shield, AlertTriangle, Save, X } from 'lucide-react';
import { useWedstrijden } from '../../hooks/useWedstrijden';
import { toast } from 'sonner';

export const AdminPage = () => {
  const { wedstrijden, loading, deleteWedstrijd, updateWedstrijd } = useWedstrijden();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({
    datum: '',
    tijd: '',
    thuisploeg: '',
    uitploeg: '',
    uitslag: '',
    opmerkingen: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter duplicaten en sorteer van nieuw naar oud
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

  const sortedWedstrijden = [...uniqueWedstrijden].sort((a, b) => {
    const dateA = new Date(a.datum + ' ' + a.tijd);
    const dateB = new Date(b.datum + ' ' + b.tijd);
    return dateA.getTime() - dateB.getTime(); // OUD naar NIEUW
  });

  const handleEdit = (wedstrijd: any) => {
    setEditingId(wedstrijd.id);
    setEditData({
      datum: wedstrijd.datum,
      tijd: wedstrijd.tijd,
      thuisploeg: wedstrijd.thuisploeg,
      uitploeg: wedstrijd.uitploeg,
      uitslag: wedstrijd.uitslag || '',
      opmerkingen: wedstrijd.opmerkingen || ''
    });
  };

  const handleSave = async (id: string) => {
    try {
      const result = await updateWedstrijd(id, editData);
      if (result.success) {
        toast.success('Wedstrijd bijgewerkt!');
        setEditingId(null);
      } else {
        toast.error('Fout bij opslaan: ' + result.error);
      }
    } catch (err: any) {
      toast.error('Fout bij opslaan: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await deleteWedstrijd(id);
      if (result.success) {
        toast.success('Wedstrijd verwijderd!');
        setDeleteConfirm(null);
      } else {
        toast.error('Fout bij verwijderen: ' + result.error);
      }
    } catch (err: any) {
      toast.error('Fout bij verwijderen: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
        <div className="animate-pulse">Laden...</div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header" style={{ borderBottom: '2px solid var(--color-border)' }}>
          <h1 className="card-title">
            <Shield size={28} /> Admin - Wedstrijdbeheer
          </h1>
          <p className="page-subtitle">Beheer en corrigeer wedstrijdgegevens</p>
        </div>

        <div style={{ padding: 'var(--spacing-lg)' }}>
          {/* Warning banner */}
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-xl)',
            display: 'flex',
            gap: 'var(--spacing-sm)',
            alignItems: 'start'
          }}>
            <AlertTriangle size={24} color="#ef4444" />
            <div>
              <div style={{ fontWeight: '700', color: '#ef4444', marginBottom: '4px' }}>
                Let op: Admin functie
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                Wijzigingen aan wedstrijdgegevens zijn permanent en worden direct doorgevoerd in alle statistieken.
              </div>
            </div>
          </div>

          {/* Wedstrijden tabel */}
          <div className="table-container">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Tijd</th>
                  <th>Thuisploeg</th>
                  <th>Uitploeg</th>
                  <th>Uitslag</th>
                  <th>Opmerkingen</th>
                  <th style={{ textAlign: 'center' }}>Acties</th>
                </tr>
              </thead>
              <tbody>
                {sortedWedstrijden.map((wedstrijd) => {
                  const isEditing = editingId === wedstrijd.id;
                  const isDeleting = deleteConfirm === wedstrijd.id;

                  return (
                    <tr key={wedstrijd.id}>
                      {isEditing ? (
                        <>
                          <td>
                            <input
                              type="date"
                              className="form-input"
                              value={editData.datum}
                              onChange={(e) => setEditData({ ...editData, datum: e.target.value })}
                              style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="time"
                              className="form-input"
                              value={editData.tijd}
                              onChange={(e) => setEditData({ ...editData, tijd: e.target.value })}
                              style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              value={editData.thuisploeg}
                              onChange={(e) => setEditData({ ...editData, thuisploeg: e.target.value })}
                              style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              value={editData.uitploeg}
                              onChange={(e) => setEditData({ ...editData, uitploeg: e.target.value })}
                              style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              value={editData.uitslag}
                              onChange={(e) => setEditData({ ...editData, uitslag: e.target.value })}
                              placeholder="3-2"
                              style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-input"
                              value={editData.opmerkingen}
                              onChange={(e) => setEditData({ ...editData, opmerkingen: e.target.value })}
                              style={{ padding: '4px 8px', fontSize: '0.875rem' }}
                            />
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleSave(wedstrijd.id)}
                                className="btn btn-primary"
                                style={{ padding: '4px 12px', fontSize: '0.875rem' }}
                              >
                                <Save size={16} />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="btn"
                                style={{ padding: '4px 12px', fontSize: '0.875rem' }}
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td>{new Date(wedstrijd.datum).toLocaleDateString('nl-BE')}</td>
                          <td>{wedstrijd.tijd}</td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {wedstrijd.thuisploeg}
                              {wedstrijd.thuisploeg === 'Ultrawear Indoor' && <span>🏠</span>}
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {wedstrijd.uitploeg}
                              {wedstrijd.uitploeg === 'Ultrawear Indoor' && <span>✈️</span>}
                            </div>
                          </td>
                          <td>
                            <span style={{
                              fontWeight: '700',
                              color: wedstrijd.uitslag && wedstrijd.uitslag !== '-' ? 'var(--color-primary)' : 'var(--color-text-secondary)'
                            }}>
                              {wedstrijd.uitslag || '-'}
                            </span>
                          </td>
                          <td style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                            {wedstrijd.opmerkingen || '-'}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {isDeleting ? (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexDirection: 'column' }}>
                                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                                  Zeker weten?
                                </div>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                  <button
                                    onClick={() => handleDelete(wedstrijd.id)}
                                    style={{
                                      padding: '4px 12px',
                                      fontSize: '0.75rem',
                                      background: '#ef4444',
                                      color: 'white',
                                      border: 'none',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer',
                                      fontWeight: '600'
                                    }}
                                  >
                                    Ja, verwijder
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm(null)}
                                    style={{
                                      padding: '4px 12px',
                                      fontSize: '0.75rem',
                                      background: 'var(--color-surface)',
                                      color: 'var(--color-text-primary)',
                                      border: '1px solid var(--color-border)',
                                      borderRadius: 'var(--radius-sm)',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Annuleer
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button
                                  onClick={() => handleEdit(wedstrijd)}
                                  className="btn"
                                  style={{ padding: '4px 12px', fontSize: '0.875rem' }}
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(wedstrijd.id)}
                                  className="btn"
                                  style={{ padding: '4px 12px', fontSize: '0.875rem', color: '#ef4444' }}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
