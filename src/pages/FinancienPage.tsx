import { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Wallet, Users, ClipboardCheck, BookOpen, Trash2, Plus, AlertTriangle, Link2, Pencil, X, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useSeizoen } from '../hooks/useSeizoen';
import { useSpelers } from '../hooks/useSpelers';
import { useFinancien, Lid } from '../hooks/useFinancien';

type Fin = ReturnType<typeof useFinancien>;
type FinTab = 'leden' | 'inschrijvingen' | 'kasboek';

const euro = (n: number) => `€ ${n.toFixed(2)}`;
const datumKort = (d: string) =>
  new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' });

const veld = (label: string, node: React.ReactNode) => (
  <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
    {label}
    {node}
  </label>
);

// ════════════════════════════════════════════════════════════════════════════
//  LEDEN
// ════════════════════════════════════════════════════════════════════════════

const LedenPanel = ({ fin }: { fin: Fin }) => {
  const { spelers } = useSpelers();
  const koppelbaar = spelers.filter((s) => !s.id.startsWith('fallback:'));
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Lid>>({});
  const [nieuw, setNieuw] = useState(false);

  const leeg: Partial<Lid> = { naam: '', speler_id: '', adres: '', geboortedatum: '', telefoon: '' };

  const startEdit = (lid: Lid) => {
    setNieuw(false);
    setEditId(lid.id);
    setForm({
      naam: lid.naam,
      speler_id: lid.speler_id || '',
      adres: lid.adres || '',
      geboortedatum: lid.geboortedatum || '',
      telefoon: lid.telefoon || '',
    });
  };

  const opslaan = async () => {
    if (!form.naam?.trim()) return toast.error('Naam is verplicht');
    const res = nieuw
      ? await fin.addLid({ ...form, naam: form.naam.trim() })
      : await fin.updateLid(editId!, form);
    if (res.success) {
      toast.success(nieuw ? 'Lid toegevoegd ✅' : 'Lid bijgewerkt ✅');
      setEditId(null); setNieuw(false); setForm({});
    } else {
      toast.error(res.error || 'Opslaan mislukt');
    }
  };

  const verwijder = async (id: string) => {
    const res = await fin.deleteLid(id);
    if (res.success) { toast.success('Lid verwijderd'); setDeleteConfirm(null); }
    else toast.error(res.error || 'Verwijderen mislukt');
  };

  const input = (key: keyof Lid, type = 'text') => (
    <input
      className="form-input"
      type={type}
      value={(form[key] as string) ?? ''}
      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
    />
  );

  const spelerSelect = (
    <select
      className="form-input"
      value={(form.speler_id as string) ?? ''}
      onChange={(e) => setForm((f) => ({ ...f, speler_id: e.target.value }))}
    >
      <option value="">— geen koppeling —</option>
      {koppelbaar.map((s) => <option key={s.id} value={s.id}>{s.naam}</option>)}
    </select>
  );

  const formBlok = (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--spacing-md)' }}>
      {veld('Naam *', input('naam'))}
      {veld('Rooster-speler', spelerSelect)}
      {veld('Adres', input('adres'))}
      {veld('Geboortedatum', input('geboortedatum', 'date'))}
      {veld('Telefoon', input('telefoon'))}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
        <button className="btn btn-primary" onClick={opslaan} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Check size={16} /> Opslaan
        </button>
        <button className="btn" onClick={() => { setEditId(null); setNieuw(false); setForm({}); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <X size={16} /> Annuleren
        </button>
      </div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><Users size={22} /> Leden</h2>
        <button
          className="btn btn-primary"
          onClick={() => { setNieuw(true); setEditId(null); setForm(leeg); }}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={16} /> Nieuw lid
        </button>
      </div>

      {nieuw && formBlok}

      {fin.leden.length === 0 ? (
        <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Nog geen leden. Draai de seed of voeg er één toe.
        </div>
      ) : (
        <div>
          {fin.leden.map((lid, i) => (
            <div key={lid.id} style={{ borderBottom: i < fin.leden.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              {editId === lid.id ? (
                <div style={{ padding: 'var(--spacing-sm)' }}>{formBlok}</div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) var(--spacing-lg)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600 }}>{lid.naam}</span>
                      {lid.speler_naam && (
                        <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', borderRadius: 'var(--radius-sm)', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Link2 size={11} /> {lid.speler_naam}
                        </span>
                      )}
                      {!lid.actief && <span style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)' }}>(inactief)</span>}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                      {lid.adres || '—'}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: '2px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>🎂 {lid.geboortedatum ? datumKort(lid.geboortedatum) : '—'}</span>
                      <span>📞 {lid.telefoon || '—'}</span>
                    </div>
                  </div>

                  {deleteConfirm === lid.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> Zeker? (wist ook inschrijvingen)
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => verwijder(lid.id)} style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Ja</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Nee</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEdit(lid)} className="btn" style={{ padding: '6px 10px' }} title="Bewerken"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteConfirm(lid.id)} className="btn" style={{ padding: '6px 10px', color: '#ef4444' }} title="Verwijderen"><Trash2 size={16} /></button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  INSCHRIJVINGEN
// ════════════════════════════════════════════════════════════════════════════

const InschrijvingenPanel = ({ fin, seizoen }: { fin: Fin; seizoen: string }) => {
  const actieveLeden = fin.leden.filter((l) => l.actief);
  const inschrMap = new Map(fin.inschrijvingen.map((i) => [i.lid_id, i]));

  const setBevestigd = async (lid_id: string, bevestigd: boolean) => {
    const res = await fin.upsertInschrijving(lid_id, { bevestigd });
    if (!res.success) toast.error(res.error || 'Mislukt');
  };
  const setVerwacht = async (lid_id: string, val: string) => {
    const num = val === '' ? null : Number(val);
    const res = await fin.upsertInschrijving(lid_id, { verwacht_lidgeld: num });
    if (!res.success) toast.error(res.error || 'Mislukt');
  };
  const boekBetaling = async (lid_id: string, bedrag: number) => {
    if (!fin.lidgeldCategorieId) return toast.error('Geen lidgeld-categorie gevonden');
    if (bedrag <= 0) return toast.error('Niets openstaand');
    const res = await fin.addTransactie({
      datum: new Date().toISOString().slice(0, 10),
      categorie_id: fin.lidgeldCategorieId,
      bedrag,
      lid_id,
      omschrijving: 'Lidgeld ' + seizoen,
    });
    if (res.success) toast.success('Lidgeld geboekt ✅');
    else toast.error(res.error || 'Mislukt');
  };

  const totVerwacht = actieveLeden.reduce((s, l) => s + (inschrMap.get(l.id)?.verwacht_lidgeld || 0), 0);
  const totBetaald = actieveLeden.reduce((s, l) => s + (fin.lidgeldBetaald.get(l.id) || 0), 0);
  const nBevestigd = actieveLeden.filter((l) => inschrMap.get(l.id)?.bevestigd).length;

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title"><ClipboardCheck size={22} /> Inschrijvingen {seizoen}</h2>
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
          <span>✅ {nBevestigd}/{actieveLeden.length} bevestigd</span>
          <span>Verwacht {euro(totVerwacht)}</span>
          <span>Betaald {euro(totBetaald)}</span>
          <span style={{ color: totVerwacht - totBetaald > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
            Openstaand {euro(Math.max(0, totVerwacht - totBetaald))}
          </span>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
              <th style={{ padding: '8px var(--spacing-lg)' }}>Lid</th>
              <th style={{ padding: '8px' }}>Speelt mee</th>
              <th style={{ padding: '8px' }}>Verwacht</th>
              <th style={{ padding: '8px' }}>Betaald</th>
              <th style={{ padding: '8px' }}>Openstaand</th>
              <th style={{ padding: '8px var(--spacing-lg)' }}></th>
            </tr>
          </thead>
          <tbody>
            {actieveLeden.map((l) => {
              const ins = inschrMap.get(l.id);
              const verwacht = ins?.verwacht_lidgeld || 0;
              const betaald = fin.lidgeldBetaald.get(l.id) || 0;
              const open = verwacht - betaald;
              return (
                <tr key={l.id} style={{ borderTop: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '10px var(--spacing-lg)', fontWeight: 600 }}>{l.naam}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <input type="checkbox" checked={!!ins?.bevestigd} onChange={(e) => setBevestigd(l.id, e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '10px 8px' }}>
                    <input
                      className="form-input"
                      type="number" min="0" step="0.5"
                      defaultValue={ins?.verwacht_lidgeld ?? ''}
                      onBlur={(e) => setVerwacht(l.id, e.target.value)}
                      style={{ width: 90 }}
                      placeholder="—"
                    />
                  </td>
                  <td style={{ padding: '10px 8px' }}>{euro(betaald)}</td>
                  <td style={{ padding: '10px 8px', color: open > 0 ? '#ef4444' : '#10b981', fontWeight: 600 }}>
                    {open > 0 ? euro(open) : (betaald > 0 ? '✓ betaald' : '—')}
                  </td>
                  <td style={{ padding: '10px var(--spacing-lg)' }}>
                    {open > 0 && (
                      <button className="btn" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => boekBetaling(l.id, open)}>
                        Boek {euro(open)}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', padding: 'var(--spacing-md) var(--spacing-lg) 0' }}>
        "Verwacht" bewaart automatisch bij het verlaten van het veld. "Boek" maakt een lidgeld-betaling in het kasboek voor het openstaande bedrag.
      </p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  KASBOEK
// ════════════════════════════════════════════════════════════════════════════

const SaldoTegel = ({ label, bedrag, kleur }: { label: string; bedrag: number; kleur?: string }) => (
  <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md) var(--spacing-lg)', flex: 1, minWidth: 130 }}>
    <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{label}</div>
    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: kleur }}>{euro(bedrag)}</div>
  </div>
);

const KasboekPanel = ({ fin, seizoen }: { fin: Fin; seizoen: string }) => {
  const [datum, setDatum] = useState(new Date().toISOString().slice(0, 10));
  const [categorieId, setCategorieId] = useState('');
  const [bedrag, setBedrag] = useState('');
  const [lidId, setLidId] = useState('');
  const [omschrijving, setOmschrijving] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [startEdit, setStartEdit] = useState(false);
  const [startVal, setStartVal] = useState(String(fin.saldo.startsaldo));
  const [nieuweCat, setNieuweCat] = useState('');
  const [nieuweCatRichting, setNieuweCatRichting] = useState<'in' | 'uit'>('in');

  const inCats = fin.categorieen.filter((c) => c.richting === 'in' && c.actief);
  const uitCats = fin.categorieen.filter((c) => c.richting === 'uit' && c.actief);

  const boek = async () => {
    if (!categorieId) return toast.error('Kies een categorie');
    const n = Number(bedrag);
    if (!n || n <= 0) return toast.error('Bedrag moet groter zijn dan 0');
    const res = await fin.addTransactie({ datum, categorie_id: categorieId, bedrag: n, lid_id: lidId || null, omschrijving });
    if (res.success) {
      toast.success('Geboekt ✅');
      setBedrag(''); setOmschrijving(''); setLidId('');
    } else toast.error(res.error || 'Mislukt');
  };

  const verwijder = async (id: string) => {
    const res = await fin.deleteTransactie(id);
    if (res.success) { toast.success('Verwijderd'); setDeleteConfirm(null); }
    else toast.error(res.error || 'Mislukt');
  };

  const bewaarStart = async () => {
    const res = await fin.setStartsaldo(Number(startVal) || 0);
    if (res.success) { toast.success('Startsaldo bijgewerkt'); setStartEdit(false); }
    else toast.error(res.error || 'Mislukt');
  };

  const voegCatToe = async () => {
    if (!nieuweCat.trim()) return;
    const res = await fin.addCategorie(nieuweCat, nieuweCatRichting);
    if (res.success) { toast.success('Categorie toegevoegd'); setNieuweCat(''); }
    else toast.error(res.error || 'Mislukt');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
      {/* Saldo */}
      <div className="card">
        <div className="card-header"><h2 className="card-title"><Wallet size={22} /> Saldo {seizoen}</h2></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: '0 var(--spacing-lg) var(--spacing-lg)', flexWrap: 'wrap' }}>
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-md) var(--spacing-lg)', flex: 1, minWidth: 150 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>Startsaldo</div>
            {startEdit ? (
              <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                <input className="form-input" type="number" step="0.01" value={startVal} onChange={(e) => setStartVal(e.target.value)} style={{ width: 100 }} />
                <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={bewaarStart}><Check size={14} /></button>
                <button className="btn" style={{ padding: '4px 8px' }} onClick={() => { setStartEdit(false); setStartVal(String(fin.saldo.startsaldo)); }}><X size={14} /></button>
              </div>
            ) : (
              <div style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                {euro(fin.saldo.startsaldo)}
                <button className="btn" style={{ padding: '2px 6px' }} onClick={() => { setStartVal(String(fin.saldo.startsaldo)); setStartEdit(true); }}><Pencil size={13} /></button>
              </div>
            )}
          </div>
          <SaldoTegel label="Inkomsten" bedrag={fin.saldo.inkomsten} kleur="#10b981" />
          <SaldoTegel label="Uitgaven" bedrag={fin.saldo.uitgaven} kleur="#ef4444" />
          <SaldoTegel label="Eindsaldo" bedrag={fin.saldo.eindsaldo} kleur={fin.saldo.eindsaldo < 0 ? '#ef4444' : 'var(--color-primary)'} />
        </div>
      </div>

      {/* Nieuwe transactie */}
      <div className="card">
        <div className="card-header"><h2 className="card-title"><Plus size={20} /> Nieuwe boeking</h2></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)' }}>
          {veld('Datum', <input className="form-input" type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />)}
          {veld('Categorie', (
            <select className="form-input" value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
              <option value="">— kies —</option>
              <optgroup label="Inkomsten">{inCats.map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}</optgroup>
              <optgroup label="Uitgaven">{uitCats.map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}</optgroup>
            </select>
          ))}
          {veld('Bedrag (€)', <input className="form-input" type="number" min="0" step="0.01" value={bedrag} onChange={(e) => setBedrag(e.target.value)} />)}
          {veld('Lid (optioneel)', (
            <select className="form-input" value={lidId} onChange={(e) => setLidId(e.target.value)}>
              <option value="">— geen —</option>
              {fin.leden.map((l) => <option key={l.id} value={l.id}>{l.naam}</option>)}
            </select>
          ))}
          {veld('Omschrijving', <input className="form-input" value={omschrijving} onChange={(e) => setOmschrijving(e.target.value)} />)}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={boek} style={{ width: '100%' }}>Boeken</button>
          </div>
        </div>
      </div>

      {/* Transactielijst */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title"><BookOpen size={20} /> Kasboek</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{fin.transacties.length} boekingen</span>
        </div>
        {fin.transacties.length === 0 ? (
          <div style={{ padding: 'var(--spacing-xl)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Nog geen boekingen dit seizoen.</div>
        ) : (
          <div>
            {fin.transacties.map((t, i) => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-lg)', borderTop: i === 0 ? '1px solid var(--color-border)' : 'none', borderBottom: '1px solid var(--color-border)', flexWrap: 'wrap' }}>
                <div style={{ width: 90, fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>{datumKort(t.datum)}</div>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{t.categorie_naam}{t.lid_naam ? ` · ${t.lid_naam}` : ''}</div>
                  {t.omschrijving && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{t.omschrijving}</div>}
                </div>
                <div style={{ fontWeight: 700, color: t.categorie_richting === 'in' ? '#10b981' : '#ef4444', minWidth: 90, textAlign: 'right' }}>
                  {t.categorie_richting === 'in' ? '+' : '−'} {euro(t.bedrag)}
                </div>
                {deleteConfirm === t.id ? (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => verwijder(t.id)} style={{ padding: '4px 10px', fontSize: '0.72rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Ja</button>
                    <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Nee</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteConfirm(t.id)} className="btn" style={{ padding: '4px 8px', color: '#ef4444' }}><Trash2 size={14} /></button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Categoriebeheer */}
      <div className="card">
        <div className="card-header"><h2 className="card-title">Categorieën</h2></div>
        <div style={{ display: 'flex', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          {veld('Nieuwe categorie', <input className="form-input" value={nieuweCat} onChange={(e) => setNieuweCat(e.target.value)} placeholder="bv. Materiaal" />)}
          {veld('Richting', (
            <select className="form-input" value={nieuweCatRichting} onChange={(e) => setNieuweCatRichting(e.target.value as 'in' | 'uit')}>
              <option value="in">Inkomst</option>
              <option value="uit">Uitgave</option>
            </select>
          ))}
          <button className="btn btn-primary" onClick={voegCatToe} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={16} /> Toevoegen</button>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', padding: '0 var(--spacing-lg) var(--spacing-lg)' }}>
          {fin.categorieen.map((c) => (
            <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', background: c.actief ? (c.richting === 'in' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)') : 'var(--color-surface)', color: c.actief ? (c.richting === 'in' ? '#10b981' : '#ef4444') : 'var(--color-text-tertiary)', opacity: c.actief ? 1 : 0.6 }}>
              {c.naam}{c.is_lidgeld ? ' ⭐' : ''}
              <button onClick={() => fin.updateCategorie(c.id, { actief: !c.actief }).then((r) => r.success && toast.success(c.actief ? 'Gearchiveerd' : 'Heractiveerd'))} title={c.actief ? 'Archiveren' : 'Heractiveren'} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
                {c.actief ? <X size={12} /> : <Check size={12} />}
              </button>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  PAGE
// ════════════════════════════════════════════════════════════════════════════

const TABS: { id: FinTab; label: string; icon: React.ReactNode }[] = [
  { id: 'leden', label: 'Leden', icon: <Users size={18} /> },
  { id: 'inschrijvingen', label: 'Inschrijvingen', icon: <ClipboardCheck size={18} /> },
  { id: 'kasboek', label: 'Kasboek', icon: <BookOpen size={18} /> },
];

export const FinancienPage = () => {
  const { seizoen } = useSeizoen();
  const fin = useFinancien(seizoen);
  const [tab, setTab] = useState<FinTab>('leden');

  return (
    <div className="container" style={{ padding: 'var(--spacing-xl)' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h1 className="card-title"><Wallet size={28} /> Financiën</h1>
            <p className="page-subtitle" style={{ margin: 0 }}>Seizoen {seizoen}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-xl)', borderBottom: '2px solid var(--color-border)', paddingBottom: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm) var(--spacing-lg)',
                background: tab === t.id ? 'var(--color-primary)' : 'var(--color-surface)',
                color: tab === t.id ? 'white' : 'var(--color-text-secondary)',
                border: tab === t.id ? 'none' : '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', cursor: 'pointer',
                fontWeight: tab === t.id ? 700 : 500, fontSize: '0.9rem',
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {fin.error && (
          <div className="card" style={{ padding: 'var(--spacing-lg)', color: '#ef4444', marginBottom: 'var(--spacing-lg)' }}>
            <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            {fin.error} — draai je <code>supabase-financien.sql</code> al?
          </div>
        )}

        {fin.loading ? (
          <div className="animate-pulse" style={{ padding: 'var(--spacing-xl)' }}>Laden...</div>
        ) : (
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {tab === 'leden' && <LedenPanel fin={fin} />}
            {tab === 'inschrijvingen' && <InschrijvingenPanel fin={fin} seizoen={seizoen} />}
            {tab === 'kasboek' && <KasboekPanel fin={fin} seizoen={seizoen} />}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
