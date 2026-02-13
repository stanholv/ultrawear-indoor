# 📊 Data Import Guide - Google Sheets → Supabase

Complete gids om je bestaande Google Sheets data te importeren in Supabase.

## 📋 Overzicht

Je hebt waarschijnlijk al wedstrijddata in je Google Sheet. Deze guide helpt je die data over te zetten naar Supabase.

## 🎯 Wat Je Nodig Hebt

- ✅ Toegang tot je Google Sheet
- ✅ Supabase project (al geconfigureerd)
- ✅ 15-30 minuten tijd

## 📁 Stap 1: Google Sheets Data Voorbereiden

### 1.1 Open Je Google Sheet

Je sheet ziet er waarschijnlijk zo uit:

| Datum | Uur | Thuisploeg | Uit ploeg | Uitslag | Speler | Aanwezig | Doelpunten | Penalty | Corner |
|-------|-----|------------|-----------|---------|--------|----------|------------|---------|--------|
| 15/01/2026 | 20:00 | Ultrawear Indoor | Team A | 5-3 | Stan | Ja | 2 | 0 | 1 |
| 15/01/2026 | 20:00 | Ultrawear Indoor | Team A | 5-3 | Rette | Ja | 1 | 0 | 0 |

### 1.2 Controleer Data Kwaliteit

✅ Check deze zaken:
- Datums zijn consistent geformatteerd
- "Aanwezig" is altijd "Ja" of "Nee" (niet "ja", "Yes", etc.)
- Getallen zijn daadwerkelijk getallen (niet "2 goals" maar "2")
- Geen lege rijen tussen data

## 📥 Stap 2: Export naar CSV

### Optie A: Eén Bestand (Simpel)

1. Selecteer **alle data** (Ctrl+A)
2. **File** > **Download** > **Comma Separated Values (.csv)**
3. Sla op als `ultrawear-data.csv`

### Optie B: Gesplitst (Geavanceerd)

Als je sheet groot is, splits het:

**Wedstrijden CSV:**
Unieke combinaties van: Datum, Uur, Thuisploeg, Uitploeg, Uitslag

**Speler Stats CSV:**
Alle rijen met: Speler, Aanwezig, Doelpunten, Penalty, Corner

## 🔧 Stap 3: Data Transformatie

### 3.1 Open CSV in Excel/Google Sheets

### 3.2 Maak Wedstrijden Tabel

Nieuwe sheet met unieke wedstrijden:

| datum | tijd | thuisploeg | uitploeg | uitslag |
|-------|------|------------|----------|---------|
| 2026-01-15 | 20:00 | Ultrawear Indoor | Team A | 5-3 |
| 2026-01-22 | 20:00 | Ultrawear Indoor | Team B | 4-4 |

**Let op formaat:**
- Datum: `YYYY-MM-DD` (bijv. 2026-01-15)
- Tijd: `HH:MM` (bijv. 20:00)

### 3.3 Maak Speler Stats Tabel

Voor Supabase heb je een `wedstrijd_id` nodig. We doen dit in 2 stappen:

**Eerst:** Upload wedstrijden
**Dan:** Upload stats met de gegenereerde wedstrijd IDs

## 📤 Stap 4: Import in Supabase

### 4.1 Wedstrijden Importeren

1. **Ga naar Supabase** → Table Editor → `wedstrijden`
2. **Klik "Insert"** → **"Import data from spreadsheet"**
3. **Upload je wedstrijden CSV**
4. **Map de kolommen:**
   ```
   CSV Kolom    →  Supabase Kolom
   datum        →  datum
   tijd         →  tijd
   thuisploeg   →  thuisploeg
   uitploeg     →  uitploeg
   uitslag      →  uitslag
   ```
5. **Klik "Import"**

### 4.2 Haal Wedstrijd IDs Op

1. **SQL Editor** in Supabase
2. Run deze query:
   ```sql
   SELECT 
     id,
     datum,
     tijd,
     uitploeg
   FROM wedstrijden
   ORDER BY datum DESC, tijd DESC;
   ```
3. **Export resultaten** als CSV
4. Nu heb je een mapping: datum+tijd+uitploeg → wedstrijd_id

### 4.3 Speler Stats Voorbereiden

Open je originele data CSV en voeg kolom `wedstrijd_id` toe:

**Excel formule** (als je IDs in kolom G hebt):
```excel
=VLOOKUP(
  A2&B2&D2,
  WedstrijdIDs!A:B,
  2,
  FALSE
)
```

Of handmatig:
- Zoek voor elke rij de juiste wedstrijd_id
- Vul in

**Resultaat:**

| wedstrijd_id | speler_naam | aanwezig | doelpunten | penalty | corner |
|--------------|-------------|----------|------------|---------|--------|
| abc-123-... | Stan | true | 2 | 0 | 1 |
| abc-123-... | Rette | true | 1 | 0 | 0 |

**Let op:**
- `aanwezig`: `true` of `false` (niet "Ja"/"Nee")
- UUIDs zijn lang: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

### 4.4 Stats Importeren

1. **Table Editor** → `speler_stats`
2. **Insert** → **Import from spreadsheet**
3. Upload je stats CSV met wedstrijd_ids
4. Map kolommen:
   ```
   CSV Kolom      →  Supabase Kolom
   wedstrijd_id   →  wedstrijd_id
   speler_naam    →  speler_naam
   aanwezig       →  aanwezig
   doelpunten     →  doelpunten
   penalty        →  penalty
   corner         →  corner
   ```
5. **Import!**

## 🔍 Stap 5: Verificatie

### 5.1 Check Wedstrijden

**SQL Editor:**
```sql
SELECT COUNT(*) as aantal_wedstrijden
FROM wedstrijden;

-- Moet overeenkomen met je Google Sheet
```

### 5.2 Check Speler Stats

```sql
SELECT 
  speler_naam,
  COUNT(*) as aanwezig,
  SUM(doelpunten) as totaal_goals
FROM speler_stats
WHERE aanwezig = true
GROUP BY speler_naam
ORDER BY totaal_goals DESC;

-- Vergelijk met Google Sheet totalen
```

### 5.3 Test in App

1. Open je app
2. Ga naar Statistieken
3. Check of alles klopt:
   - Aantal wedstrijden
   - Totaal doelpunten
   - Speler rankings

## 🚨 Troubleshooting

### "Invalid date format"
Google Sheets datums zijn vaak `DD/MM/YYYY`.
Supabase wil `YYYY-MM-DD`.

**Excel formule:**
```excel
=TEXT(A2, "YYYY-MM-DD")
```

### "Foreign key violation"
Je probeert stats toe te voegen voor een wedstrijd_id die niet bestaat.

**Fix:**
```sql
-- Check welke IDs bestaan
SELECT id FROM wedstrijden;

-- Check je stats CSV, alle wedstrijd_ids moeten in deze lijst staan
```

### "Duplicate key value"
Je probeert dezelfde wedstrijd 2x toe te voegen.

**Fix:**
```sql
-- Verwijder duplicates
DELETE FROM wedstrijden a
USING wedstrijden b
WHERE a.id > b.id
  AND a.datum = b.datum
  AND a.tijd = b.tijd
  AND a.uitploeg = b.uitploeg;
```

### "Boolean value error"
Supabase wil `true/false`, niet `"Ja"/"Nee"`.

**Excel formule:**
```excel
=IF(A2="Ja", "true", "false")
```

## 💡 Script Methode (Geavanceerd)

Voor grotere datasets, gebruik een import script:

### Node.js Script

```javascript
// import.js
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import csv from 'csv-parser';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SERVICE_ROLE_KEY' // LET OP: Service role, niet anon!
);

const wedstrijden = [];
const stats = [];

// Lees CSV
fs.createReadStream('ultrawear-data.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Verwerk elke rij
    // ...
  })
  .on('end', async () => {
    // Upload naar Supabase
    const { data: wedstrijdenData } = await supabase
      .from('wedstrijden')
      .insert(wedstrijden)
      .select();
    
    // Map wedstrijd IDs
    // Upload stats
    // ...
  });
```

**Run:**
```bash
npm install @supabase/supabase-js csv-parser
node import.js
```

## ✅ Checklist

- [ ] Google Sheet data geëxporteerd
- [ ] CSV geformatteerd (datums, booleans)
- [ ] Wedstrijden geïmporteerd in Supabase
- [ ] Wedstrijd IDs opgehaald
- [ ] Stats CSV voorbereid met wedstrijd_ids
- [ ] Stats geïmporteerd
- [ ] Data geverifieerd (counts kloppen)
- [ ] App getest (statistieken tonen correct)
- [ ] Google Sheet kan naar archief (bewaar als backup!)

## 🎉 Success!

Je data is nu in Supabase! 

### Voordelen:
- ✅ Snellere queries
- ✅ Betere filtering/zoeken
- ✅ Real-time updates mogelijk
- ✅ Proper relaties tussen data
- ✅ Automatische backups

### Volgende Stappen:
1. Test alle flows in de app
2. Maak een backup van je Supabase data
3. Archiveer je Google Sheet (niet verwijderen!)
4. Geniet van je moderne app! 🎊

## 📞 Hulp Nodig?

Als je vastloopt:
1. Check de error messages in Supabase
2. Verifieer je CSV formatting
3. Test met een klein sample eerst (5 rijen)
4. Check de Supabase docs: https://supabase.com/docs

Happy importing! 📊⚽
