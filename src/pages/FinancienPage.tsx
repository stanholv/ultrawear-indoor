import { useState } from 'react';
import { motion } from 'framer-motion';
// @ts-ignore
import { Users, ClipboardCheck, BookOpen, Trash2, Plus, AlertTriangle, Link2, Pencil, X, Check, Copy, Table as TableIcon, Download, List } from 'lucide-react';
import { toast } from 'sonner';
import { useSeizoen } from '../hooks/useSeizoen';
import { useSpelers } from '../hooks/useSpelers';
import { useFinancien, lidIsActief, Lid } from '../hooks/useFinancien';
import { SectieKop } from '../components/UI/editorial';

type Fin = ReturnType<typeof useFinancien>;
type FinTab = 'leden' | 'inschrijvingen' | 'kasboek';

const GROEN = '#10b981';
const ROOD = '#ef4444';

const euro = (n: number) => `€ ${n.toFixed(2)}`;
const datumKort = (d: string) =>
  new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: 'short', year: 'numeric' });

const cijfer: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };

// "Rode tick + groot getal + kicker" — het terugkerende cijfer-rail-motief.
const Kengetal = ({ label, waarde, kleur, groot, actie }: {
  label: string; waarde: string; kleur?: string; groot?: boolean; actie?: React.ReactNode;
}) => (
  <div style={{ minWidth: 104 }}>
    <div style={{ width: 26, height: 3, background: 'var(--color-primary)', marginBottom: 6 }} />
    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: groot ? '2rem' : '1.6rem', lineHeight: 1, color: kleur, display: 'flex', alignItems: 'center', gap: 8, ...cijfer }}>
      {waarde}{actie}
    </div>
    <div className="kicker" style={{ marginTop: 5 }}>{label}</div>
  </div>
);

const veld = (label: string, node: React.ReactNode) => (
  <label className="kicker" style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    {label}
    {node}
  </label>
);

const legeStaat = (tekst: string) => (
  <div style={{ padding: 'var(--spacing-2xl) var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>{tekst}</div>
);

// Tabelkop-cel in kicker-stijl.
const th = (label: string, extra?: React.CSSProperties) => (
  <th className="kicker" style={{ textAlign: 'left', padding: '8px 12px', whiteSpace: 'nowrap', ...extra }}>{label}</th>
);
const hairline = '1px solid var(--color-line, var(--color-border))';

// ════════════════════════════════════════════════════════════════════════════
//  LEDEN
// ════════════════════════════════════════════════════════════════════════════

const LedenPanel = ({ fin }: { fin: Fin }) => {
  const { spelers } = useSpelers();
  const koppelbaar = spelers.filter((s) => !s.id.startsWith('fallback:'));
  // Op de financiële ledenpagina tonen we enkel actieve leden (incl. rooster-status).
  const zichtbareLeden = fin.leden.filter(lidIsActief);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Lid>>({});
  const [nieuw, setNieuw] = useState(false);
  const [weergave, setWeergave] = useState<'lijst' | 'tabel'>('lijst');

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

  // Overzichtstabel voor het competitiedocument: makkelijk kopieerbaar.
  const kolommen = ['Naam', 'Geboortedatum', 'Adres', 'Telefoon'];
  const rijen = zichtbareLeden.map((l) => [
    l.naam,
    l.geboortedatum ? new Date(l.geboortedatum).toLocaleDateString('nl-BE') : '',
    l.adres || '',
    l.telefoon || '',
  ]);

  const kopieerTabel = async () => {
    // Tab-gescheiden → plakt netjes als tabel in Word/Excel/Google Docs.
    const tsv = [kolommen.join('\t'), ...rijen.map((r) => r.join('\t'))].join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      toast.success('Tabel gekopieerd — plak in je document (Ctrl+V)');
    } catch {
      toast.error('Kopiëren mislukt — probeer de CSV-download');
    }
  };

  const downloadCsv = () => {
    const esc = (v: string) => (/[",\n;]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v);
    const csv = [kolommen, ...rijen].map((r) => r.map(esc).join(';')).join('\r\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }); // BOM → accenten kloppen in Excel
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leden-overzicht.csv';
    a.click();
    URL.revokeObjectURL(url);
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
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--spacing-md)', padding: 'var(--spacing-lg) 0', borderTop: `2px solid var(--color-primary)`, borderBottom: hairline, marginBottom: 'var(--spacing-lg)' }}>
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
    <div>
      <SectieKop titel="Leden" />

      {/* Bedieningsrij: weergave-schakelaar + nieuw lid */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
        <div className="filter-tabs" style={{ margin: 0 }}>
          <button className={`filter-tab ${weergave === 'lijst' ? 'active' : ''}`} onClick={() => setWeergave('lijst')}>
            <List size={16} /> Lijst
          </button>
          <button className={`filter-tab ${weergave === 'tabel' ? 'active' : ''}`} onClick={() => setWeergave('tabel')}>
            <TableIcon size={16} /> Tabel
          </button>
        </div>
        <div style={{ flex: 1 }} />
        <button className="btn btn-primary" onClick={() => { setNieuw(true); setEditId(null); setForm(leeg); }} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Plus size={16} /> Nieuw lid
        </button>
      </div>

      {nieuw && formBlok}

      {zichtbareLeden.length === 0 ? (
        legeStaat('Nog geen actieve leden. Draai de seed of voeg er één toe.')
      ) : weergave === 'tabel' ? (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: 'var(--spacing-md)', flexWrap: 'wrap', alignItems: 'center' }}>
            <button className="btn btn-primary" onClick={kopieerTabel} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Copy size={16} /> Kopieer tabel
            </button>
            <button className="btn" onClick={downloadCsv} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Download size={16} /> CSV
            </button>
            <span className="kicker">{zichtbareLeden.length} leden · plakt als tabel in Word/Excel</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid var(--color-text-primary)` }}>
                  {kolommen.map((k) => th(k))}
                </tr>
              </thead>
              <tbody>
                {rijen.map((r, i) => (
                  <tr key={i} style={{ borderBottom: hairline }}>
                    {r.map((cel, j) => (
                      <td style={{ padding: '10px 12px', whiteSpace: j === 2 ? 'normal' : 'nowrap', color: cel ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)' }} key={j}>
                        {cel || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          {zichtbareLeden.map((lid) => (
            <div key={lid.id} style={{ borderBottom: hairline }}>
              {editId === lid.id ? (
                formBlok
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-md) var(--spacing-xs)', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem' }}>{lid.naam}</span>
                      {lid.speler_naam && (
                        <span style={{ background: 'rgba(16,185,129,0.14)', color: GROEN, borderRadius: 'var(--radius-sm)', padding: '1px 8px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                          <Link2 size={11} /> {lid.speler_naam}
                        </span>
                      )}
                      {!lid.actief && <span className="kicker">inactief</span>}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', marginTop: '3px' }}>
                      {lid.adres || '—'}
                    </div>
                    <div className="kicker" style={{ marginTop: '3px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                      <span>🎂 {lid.geboortedatum ? datumKort(lid.geboortedatum) : '—'}</span>
                      <span>📞 {lid.telefoon || '—'}</span>
                    </div>
                  </div>

                  {deleteConfirm === lid.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '0.75rem', color: ROOD, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertTriangle size={12} /> Zeker? (wist ook inschrijvingen)
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button onClick={() => verwijder(lid.id)} style={{ padding: '4px 12px', fontSize: '0.75rem', background: ROOD, color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontWeight: 600 }}>Ja</button>
                        <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 12px', fontSize: '0.75rem', background: 'var(--color-surface)', color: 'var(--color-text-primary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Nee</button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button onClick={() => startEdit(lid)} className="btn" style={{ padding: '6px 10px' }} title="Bewerken"><Pencil size={16} /></button>
                      <button onClick={() => setDeleteConfirm(lid.id)} className="btn" style={{ padding: '6px 10px', color: ROOD }} title="Verwijderen"><Trash2 size={16} /></button>
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
  const actieveLeden = fin.leden.filter(lidIsActief);
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
  const totOpen = Math.max(0, totVerwacht - totBetaald);
  const nBevestigd = actieveLeden.filter((l) => inschrMap.get(l.id)?.bevestigd).length;

  return (
    <div>
      <SectieKop titel="Inschrijvingen" />

      {/* Cijfer-rail */}
      <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', flexWrap: 'wrap', margin: 'var(--spacing-md) 0 var(--spacing-xl)' }}>
        <Kengetal label={`van ${actieveLeden.length} bevestigd`} waarde={String(nBevestigd)} />
        <Kengetal label="Verwacht" waarde={euro(totVerwacht)} />
        <Kengetal label="Betaald" waarde={euro(totBetaald)} kleur={GROEN} />
        <Kengetal label="Openstaand" waarde={euro(totOpen)} kleur={totOpen > 0 ? ROOD : GROEN} groot />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid var(--color-text-primary)` }}>
              {th('Lid')}
              {th('Speelt mee')}
              {th('Verwacht')}
              {th('Betaald')}
              {th('Openstaand')}
              {th('')}
            </tr>
          </thead>
          <tbody>
            {actieveLeden.map((l) => {
              const ins = inschrMap.get(l.id);
              const verwacht = ins?.verwacht_lidgeld || 0;
              const betaald = fin.lidgeldBetaald.get(l.id) || 0;
              const open = verwacht - betaald;
              return (
                <tr key={l.id} style={{ borderBottom: hairline }}>
                  <td style={{ padding: '10px 12px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>{l.naam}</td>
                  <td style={{ padding: '10px 12px' }}>
                    <input type="checkbox" checked={!!ins?.bevestigd} onChange={(e) => setBevestigd(l.id, e.target.checked)} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-primary)' }} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <input
                      className="form-input"
                      type="number" min="0" step="0.5"
                      defaultValue={ins?.verwacht_lidgeld ?? ''}
                      onBlur={(e) => setVerwacht(l.id, e.target.value)}
                      style={{ width: 90, ...cijfer }}
                      placeholder="—"
                    />
                  </td>
                  <td style={{ padding: '10px 12px', ...cijfer }}>{euro(betaald)}</td>
                  <td style={{ padding: '10px 12px', color: open > 0 ? ROOD : GROEN, fontWeight: 700, ...cijfer }}>
                    {open > 0 ? euro(open) : (betaald > 0 ? '✓ betaald' : '—')}
                  </td>
                  <td style={{ padding: '10px 12px' }}>
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
      <p className="kicker" style={{ marginTop: 'var(--spacing-md)', textTransform: 'none', letterSpacing: 0 }}>
        "Verwacht" bewaart bij het verlaten van het veld. "Boek" maakt een lidgeld-betaling in het kasboek voor het openstaande bedrag.
      </p>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  KASBOEK
// ════════════════════════════════════════════════════════════════════════════

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
    <div>
      {/* 01 — Saldo */}
      <SectieKop index="01" titel="Saldo" />
      <div style={{ display: 'flex', gap: 'var(--spacing-2xl)', flexWrap: 'wrap', margin: 'var(--spacing-md) 0 var(--spacing-xl)' }}>
        {startEdit ? (
          <div style={{ minWidth: 104 }}>
            <div style={{ width: 26, height: 3, background: 'var(--color-primary)', marginBottom: 6 }} />
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input className="form-input" type="number" step="0.01" value={startVal} onChange={(e) => setStartVal(e.target.value)} style={{ width: 100, ...cijfer }} />
              <button className="btn btn-primary" style={{ padding: '4px 8px' }} onClick={bewaarStart}><Check size={14} /></button>
              <button className="btn" style={{ padding: '4px 8px' }} onClick={() => { setStartEdit(false); setStartVal(String(fin.saldo.startsaldo)); }}><X size={14} /></button>
            </div>
            <div className="kicker" style={{ marginTop: 5 }}>Startsaldo</div>
          </div>
        ) : (
          <Kengetal
            label="Startsaldo"
            waarde={euro(fin.saldo.startsaldo)}
            actie={<button className="btn" style={{ padding: '2px 6px' }} onClick={() => { setStartVal(String(fin.saldo.startsaldo)); setStartEdit(true); }}><Pencil size={13} /></button>}
          />
        )}
        <Kengetal label="Inkomsten" waarde={euro(fin.saldo.inkomsten)} kleur={GROEN} />
        <Kengetal label="Uitgaven" waarde={euro(fin.saldo.uitgaven)} kleur={ROOD} />
        <Kengetal label="Eindsaldo" waarde={euro(fin.saldo.eindsaldo)} kleur={fin.saldo.eindsaldo < 0 ? ROOD : 'var(--color-primary)'} groot />
      </div>

      {/* 02 — Nieuwe boeking */}
      <SectieKop index="02" titel="Nieuwe boeking" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 'var(--spacing-md)', margin: 'var(--spacing-md) 0 var(--spacing-xl)' }}>
        {veld('Datum', <input className="form-input" type="date" value={datum} onChange={(e) => setDatum(e.target.value)} />)}
        {veld('Categorie', (
          <select className="form-input" value={categorieId} onChange={(e) => setCategorieId(e.target.value)}>
            <option value="">— kies —</option>
            <optgroup label="Inkomsten">{inCats.map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}</optgroup>
            <optgroup label="Uitgaven">{uitCats.map((c) => <option key={c.id} value={c.id}>{c.naam}</option>)}</optgroup>
          </select>
        ))}
        {veld('Bedrag (€)', <input className="form-input" type="number" min="0" step="0.01" value={bedrag} onChange={(e) => setBedrag(e.target.value)} style={cijfer} />)}
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

      {/* 03 — Kasboek */}
      <SectieKop index="03" titel="Kasboek" />
      {fin.transacties.length === 0 ? (
        legeStaat('Nog geen boekingen dit seizoen.')
      ) : (
        <div style={{ margin: 'var(--spacing-md) 0 var(--spacing-xl)' }}>
          {fin.transacties.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', padding: 'var(--spacing-sm) var(--spacing-xs)', borderBottom: hairline, flexWrap: 'wrap' }}>
              <div className="kicker" style={{ width: 88, ...cijfer }}>{datumKort(t.datum)}</div>
              <div style={{ flex: 1, minWidth: 160 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.98rem' }}>{t.categorie_naam}{t.lid_naam ? ` · ${t.lid_naam}` : ''}</div>
                {t.omschrijving && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>{t.omschrijving}</div>}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', color: t.categorie_richting === 'in' ? GROEN : ROOD, minWidth: 96, textAlign: 'right', ...cijfer }}>
                {t.categorie_richting === 'in' ? '+' : '−'} {euro(t.bedrag)}
              </div>
              {deleteConfirm === t.id ? (
                <div style={{ display: 'flex', gap: 4 }}>
                  <button onClick={() => verwijder(t.id)} style={{ padding: '4px 10px', fontSize: '0.72rem', background: ROOD, color: 'white', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Ja</button>
                  <button onClick={() => setDeleteConfirm(null)} style={{ padding: '4px 10px', fontSize: '0.72rem', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>Nee</button>
                </div>
              ) : (
                <button onClick={() => setDeleteConfirm(t.id)} className="btn" style={{ padding: '4px 8px', color: ROOD }}><Trash2 size={14} /></button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 04 — Categorieën */}
      <SectieKop index="04" titel="Categorieën" />
      <div style={{ display: 'flex', gap: 'var(--spacing-md)', margin: 'var(--spacing-md) 0 var(--spacing-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        {veld('Nieuwe categorie', <input className="form-input" value={nieuweCat} onChange={(e) => setNieuweCat(e.target.value)} placeholder="bv. Materiaal" />)}
        {veld('Richting', (
          <select className="form-input" value={nieuweCatRichting} onChange={(e) => setNieuweCatRichting(e.target.value as 'in' | 'uit')}>
            <option value="in">Inkomst</option>
            <option value="uit">Uitgave</option>
          </select>
        ))}
        <button className="btn btn-primary" onClick={voegCatToe} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={16} /> Toevoegen</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {fin.categorieen.map((c) => (
          <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', fontWeight: 600, background: c.actief ? (c.richting === 'in' ? 'rgba(16,185,129,0.14)' : 'rgba(239,68,68,0.14)') : 'var(--color-surface)', color: c.actief ? (c.richting === 'in' ? GROEN : ROOD) : 'var(--color-text-tertiary)', opacity: c.actief ? 1 : 0.6 }}>
            {c.naam}{c.is_lidgeld ? ' ⭐' : ''}
            <button onClick={() => fin.updateCategorie(c.id, { actief: !c.actief }).then((r) => r.success && toast.success(c.actief ? 'Gearchiveerd' : 'Heractiveerd'))} title={c.actief ? 'Archiveren' : 'Heractiveren'} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit', padding: 0, display: 'flex' }}>
              {c.actief ? <X size={12} /> : <Check size={12} />}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  SECTIE (ingesloten in Admin-controlepaneel)
// ════════════════════════════════════════════════════════════════════════════

const TABS: { id: FinTab; label: string; icon: React.ReactNode }[] = [
  { id: 'leden', label: 'Leden', icon: <Users size={16} /> },
  { id: 'inschrijvingen', label: 'Inschrijvingen', icon: <ClipboardCheck size={16} /> },
  { id: 'kasboek', label: 'Kasboek', icon: <BookOpen size={16} /> },
];

export const FinancienSection = () => {
  const { seizoen } = useSeizoen();
  const fin = useFinancien(seizoen);
  const [tab, setTab] = useState<FinTab>('leden');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <p className="page-subtitle" style={{ marginBottom: 'var(--spacing-lg)' }}>Seizoen {seizoen}</p>

      <div className="filter-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`filter-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {fin.error && (
        <div style={{ borderLeft: `3px solid ${ROOD}`, padding: 'var(--spacing-sm) var(--spacing-md)', color: ROOD, marginBottom: 'var(--spacing-lg)' }}>
          <AlertTriangle size={16} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          {fin.error} — is <code>supabase/schema.sql</code> volledig uitgevoerd?
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
  );
};
