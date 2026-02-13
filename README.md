# ⚽ Ultrawear Indoor App

Moderne web applicatie voor het beheren van minivoetbal wedstrijden en statistieken.

## 🎯 Features

- ✅ **Authenticatie**: Veilig inloggen met email/wachtwoord
- ✅ **Role-based toegang**: Admin vs Speler rechten
- ✅ **Statistieken**: Real-time speler statistieken en leaderboard
- ✅ **Wedstrijd tracking**: Score invoeren voor admins
- ✅ **Responsive design**: Werkt op desktop, tablet en mobiel
- ✅ **Modern stack**: React + TypeScript + Supabase

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Styling**: Custom CSS (gebaseerd op origineel design)
- **Hosting**: Netlify (gratis tier)
- **Version Control**: Git + GitHub

## 📦 Vereisten

- Node.js 18+ en npm
- Supabase account (gratis)
- Netlify account (gratis)
- GitHub account

## 🚀 Installatie & Setup

### Stap 1: Supabase Project Setup

1. Ga naar [supabase.com](https://supabase.com) en maak een gratis account
2. Maak een nieuw project aan:
   - Project naam: `ultrawear-indoor`
   - Database wachtwoord: kies een sterk wachtwoord (bewaar dit!)
   - Regio: kies dichtstbijzijnde (bijv. West Europe)
3. Wacht tot het project klaar is (~2 minuten)

### Stap 2: Database Schema Aanmaken

1. Ga naar je Supabase project dashboard
2. Klik op **SQL Editor** in het linkermenu
3. Open het bestand `supabase-schema.sql` in deze repository
4. Kopieer de volledige inhoud
5. Plak in de SQL Editor en klik op **Run**
6. Controleer of er geen errors zijn (alles zou groen moeten zijn)

### Stap 3: Eerste Admin Gebruiker Aanmaken

1. Ga naar **Authentication** > **Users** in Supabase
2. Klik op **Add user** > **Create new user**
3. Vul in:
   - Email: jouw admin email
   - Password: kies een sterk wachtwoord
   - Auto Confirm User: ✅ (vink aan)
4. Klik **Create user**
5. Kopieer de User UID (je hebt dit zo nodig)

### Stap 4: Admin Rol Toekennen

1. Ga naar **Table Editor** > **profiles** tabel
2. Je ziet je nieuwe gebruiker (of nog niet, dan eerst even refreshen)
3. Klik op je gebruiker en edit de `role` kolom
4. Verander van `speler` naar `admin`
5. Sla op

**Alternatief via SQL:**
```sql
-- Vervang 'YOUR-USER-ID' met je User UID
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'YOUR-USER-ID';
```

### Stap 5: Supabase Credentials Ophalen

1. Ga naar **Project Settings** (tandwiel icoon)
2. Klik op **API** in het linkermenu
3. Kopieer de volgende waarden:
   - **Project URL**: bijvoorbeeld `https://abcdefg.supabase.co`
   - **anon public** key: lange string die begint met `eyJ...`

### Stap 6: Lokale Development Setup

1. Clone deze repository:
```bash
git clone https://github.com/jouw-username/ultrawear-indoor.git
cd ultrawear-indoor
```

2. Installeer dependencies:
```bash
npm install
```

3. Maak `.env.local` bestand aan:
```bash
cp .env.example .env.local
```

4. Open `.env.local` en vul je Supabase credentials in:
```env
VITE_SUPABASE_URL=https://jouw-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

5. Start de development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in je browser

7. Test de app:
   - Log in met je admin credentials
   - Probeer een wedstrijd in te voeren
   - Check of de statistieken werken

### Stap 7: Deployment naar Netlify

1. Push je code naar GitHub:
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/jouw-username/ultrawear-indoor.git
git push -u origin main
```

2. Ga naar [netlify.com](https://netlify.com) en log in
3. Klik **Add new site** > **Import an existing project**
4. Kies **GitHub** en autoriseer Netlify
5. Selecteer je `ultrawear-indoor` repository
6. Configureer build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
7. Klik **Show advanced** > **New variable** en voeg toe:
   - `VITE_SUPABASE_URL`: jouw Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: jouw Supabase anon key
8. Klik **Deploy site**
9. Wacht ~2 minuten tot deployment klaar is
10. Test je live site! 🎉

### Stap 8: Custom Domein (Optioneel)

Als je een eigen domeinnaam wilt (bijv. ultrawear.be):

1. Ga naar je Netlify site dashboard
2. **Domain settings** > **Add custom domain**
3. Volg de instructies om DNS records in te stellen
4. SSL wordt automatisch geconfigureerd door Netlify

## 📱 Gebruik

### Als Speler
- Bekijk statistieken en leaderboard
- Geen login vereist voor lezen

### Als Admin
1. Log in met je admin account
2. Ga naar **Wedstrijd Invoeren** tab
3. Vul wedstrijdgegevens in:
   - Datum en tijd
   - Tegenstander
   - Resultaat
4. Vink aan welke spelers aanwezig waren
5. Vul doelpunten, penalties en corners in
6. Klik **Verzenden**
7. Statistieken worden automatisch bijgewerkt!

## 🔒 Beveiliging

### Row Level Security (RLS)
- Iedereen kan statistieken **lezen**
- Alleen **admins** kunnen data **toevoegen/wijzigen/verwijderen**
- RLS policies worden afgedwongen op database niveau
- Zelfs met API keys kunnen gebruikers geen ongeautoriseerde acties uitvoeren

### Best Practices
- Gebruik sterke wachtwoorden (min. 12 karakters)
- Deel nooit je `.env.local` bestand
- Deel nooit je Supabase service_role key (gebruik alleen anon key)
- Verander regelmatig wachtwoorden

## 🔄 Data Migratie van Google Sheets

Als je bestaande data in Google Sheets hebt:

### Optie 1: Handmatige Export/Import
1. Open je Google Sheet
2. **File** > **Download** > **CSV**
3. Ga naar Supabase **Table Editor**
4. Klik op een tabel > **Insert** > **Import data from CSV**
5. Upload je CSV en map de kolommen

### Optie 2: Script (voor grote datasets)
Maak een Node.js script om data te migreren:

```javascript
// migrate-data.js
import { createClient } from '@supabase/supabase-js';
import { GoogleSpreadsheet } from 'google-spreadsheet';

// Setup...
// Code beschikbaar op aanvraag
```

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check of `.env.local` bestaat
- Check of de variabelen de juiste namen hebben (`VITE_` prefix)
- Restart development server na wijzigen van .env

### "You do not have permission to perform this action"
- Check of je ingelogd bent als admin
- Check de `role` kolom in de `profiles` tabel
- Check of RLS policies correct zijn toegepast

### Deployment werkt niet
- Check of environment variables in Netlify zijn ingesteld
- Check build logs voor errors
- Zorg dat `dist/` folder wordt gegenereerd bij build

### Data wordt niet opgeslagen
- Check browser console voor errors
- Check of Supabase credentials correct zijn
- Check of RLS policies correct zijn

## 📊 Extra Features (Toekomstig)

Mogelijke uitbreidingen:

- [ ] Email notificaties bij nieuwe wedstrijden
- [ ] Kalender integratie
- [ ] Grafiek visualisaties
- [ ] Export naar PDF/Excel
- [ ] Man of the Match voting
- [ ] Foto's uploaden per wedstrijd
- [ ] Aanwezigheid bevestigen via link
- [ ] Statistieken per seizoen
- [ ] Mobile app (React Native)

## 🤝 Bijdragen

Pull requests zijn welkom! Voor grote wijzigingen, open eerst een issue.

## 📝 Licentie

MIT

## 👥 Team

Ultrawear Indoor Minivoetbal Ploeg

## 📞 Support

Vragen? Open een GitHub issue of stuur een email.

---

**Veel plezier met de app! ⚽🔥**
