# 🏆 ULTRAWEAR INDOOR - Complete Project Knowledge v2.5

## 📋 PROJECT OVERVIEW

**Name:** Ultrawear Indoor
**Type:** Indoor Soccer Team Statistics & Management App
**Tech Stack:** React + TypeScript + Vite + Supabase + Vercel
**Version:** v2.5 (April 2026)
**Deploy:** GitHub → Vercel (automatisch bij elke push naar main) ✅
**Repo:** https://github.com/stanholv/ultrawear-indoor
**Production:** https://ultrawear-indoor.vercel.app
**Branch:** main / feature/player-profiles
**Team:** 14 players (Stan, Rette, Wanny, Arne, Emile, Vik, Nicolas, Mats, Brian, Slekke, Didier, Elias, Toby, Pieter)

---

## 🎨 DESIGN SYSTEM

### Colors (Jersey-Inspired)
- **Primary:** #C8102E (Ultrawear Red)
- **Secondary:** #1A1A1A (Black)
- **Accent:** #f59e0b (Orange/Gold)
- **Pattern:** Diagonal red/black stripes (45deg, 12px intervals)

### Key Design Elements
- Diagonal stripe pattern in headers (15% opacity overlay)
- Red/black color scheme throughout
- Sporty, dynamic feel
- Dark mode as default
- No Napoleon mascotte (gambling sponsor - excluded)

### Positie Kleuren
- Keeper: #f59e0b
- Verdediger: #3b82f6
- Middenvelder: #10b981
- Aanvaller: #C8102E

---

## 🗄️ DATABASE SCHEMA (Supabase)

### Tables

**profiles**
```sql
- id: UUID (primary key)
- full_name: TEXT
- email: TEXT
- role: TEXT ('admin' | 'speler')
- speler_naam: TEXT (v2.5 - koppeling aan SPELERS array)
- rugnummer: INTEGER (v2.5)
- positie: TEXT (v2.5)
- bio: TEXT (v2.5)
- profile_photo_url: TEXT (toekomst)
- created_at: TIMESTAMPTZ
```

**wedstrijden**
```sql
- id: UUID (primary key)
- datum: DATE
- tijd: TIME
- thuisploeg: TEXT (always 'Ultrawear Indoor')
- uitploeg: TEXT
- uitslag: TEXT (e.g., '5-3')
- type: TEXT ('competitie' | 'beker' | 'oefenwedstrijd')
- opmerkingen: TEXT
- created_at: TIMESTAMPTZ
```

**speler_stats**
```sql
- id: UUID (primary key)
- wedstrijd_id: UUID (foreign key → wedstrijden)
- speler_naam: TEXT
- aanwezig: BOOLEAN
- doelpunten: INTEGER
- penalty: INTEGER
- corner: INTEGER
- created_at: TIMESTAMPTZ
```

**reviews** (v2.5)
```sql
- id: UUID (primary key)
- speler_naam: TEXT
- score: INTEGER (1-5)
- commentaar: TEXT
- reviewer_naam: TEXT
- ip_adres: TEXT
- created_at: TIMESTAMPTZ
```

### RLS Policies
- Public read access for stats, reviews
- Authenticated write for wedstrijden/stats
- Admin-only delete/update
- Anyone can insert reviews (spam protection via IP + tijd)

---

## 📁 FILE STRUCTURE

```
src/
├── components/
│   ├── Admin/
│   │   ├── AdminPage.tsx          ✅ v2.5 (tabs: Speler Koppelingen + Reviews)
│   │   └── SpelerKoppelingPanel.tsx ✅ v2.5 NEW
│   ├── Auth/
│   │   ├── LoginForm.tsx
│   │   └── ProtectedRoute.tsx
│   ├── Dashboard/
│   │   └── AdminDashboard.tsx
│   ├── Home/
│   │   ├── HomePage.tsx
│   │   ├── NextMatchCard.tsx
│   │   └── TopScorerTable.tsx
│   ├── Layout/
│   │   ├── Header.tsx
│   │   └── Navigation.tsx         ✅ v2.5 (+ Spelers tab)
│   ├── Stats/
│   │   ├── StatsPage.tsx
│   │   ├── StatsTable.tsx         ✅ v2.5 (klikbare spelersnamen)
│   │   └── StatsOverview.tsx
│   ├── UI/
│   │   ├── NumberInput.tsx
│   │   └── MatchTypeBadge.tsx
│   └── Wedstrijden/
│       └── WedstrijdForm.tsx
├── hooks/
│   ├── useAuth.ts                 ✅ v2.5 (+ refreshProfile)
│   ├── useProfiles.ts             ✅ v2.5 NEW
│   ├── useStats.ts
│   └── useWedstrijden.ts
├── lib/
│   ├── copy.ts
│   ├── supabase.ts
│   └── types.ts                   ✅ v2.5 (+ PlayerProfile, Review, POSITIES)
├── pages/
│   ├── DetailedStats.tsx
│   ├── SpelersPage.tsx            ✅ v2.5 NEW
│   ├── SpelerProfielPage.tsx      ✅ v2.5 NEW
│   └── WedstrijdDetailPage.tsx
├── styles/
│   └── globals.css
└── App.tsx                        ✅ v2.5 (+ /spelers + /spelers/:naam routes)
```

---

## 🎯 v2.5 FEATURES (CURRENT)

### ✅ Geïmplementeerd

1. **Spelers Overzichtspagina** (`/spelers`)
   - Alfabetisch gesorteerd
   - Lijstweergave (geen cards) op desktop
   - Rugnummer badge, positie kleur, goals + wedstrijden preview
   - Klik → naar individueel profiel
   - Link in navigatie

2. **Speler Profielpagina** (`/spelers/:naam`)
   - Hero card met naam, rugnummer, positie, bio, gemiddelde reviewscore
   - 4 stat cards: wedstrijden, doelpunten, corners, penalties
   - Bewerkingsformulier (rugnummer, positie, bio) voor gekoppelde speler of admin
   - Bewerken knop zichtbaar op rode hero: wit/transparant stijl
   - Reviews sectie met sterren, reviewer naam, commentaar, datum

3. **Reviews Systeem**
   - Iedereen (ook niet ingelogd) kan review schrijven
   - Verplichte naam + score (1-5 sterren), optioneel commentaar
   - Spam bescherming: max 1 review per IP per speler per uur
   - Gemiddelde score getoond in hero + overzichtspagina

4. **Admin: Speler Koppeling**
   - Tab "Speler Koppelingen" in AdminPage
   - Dropdown per account: koppel account X aan speler 'Wanny'
   - Eén account per speler, automatisch oude koppeling verwijderd
   - Gekoppelde speler ziet groene badge

5. **Klikbare Spelersnamen**
   - In StatsTable → klik op naam → `/spelers/:naam`
   - Underline hover effect

6. **useAuth refreshProfile**
   - `refreshProfile()` beschikbaar in context
   - Herlaadt profiel na koppeling zonder uitloggen

### ✅ Eerder geïmplementeerd (v2.2 - v2.4.2)

- Jersey theme (rood/zwart, diagonale strepen)
- +/- NumberInput, wedstrijdtype selector
- Statistieken met filter tabs, rankings, progress bars
- Homepage met next match, top 5 scorers, seizoensoverzicht
- Uitslagen pagina + wedstrijd detail pagina
- Admin wedstrijdbeheer (edit/delete)
- Vercel Analytics (`@vercel/analytics/react`)
- GitHub → Vercel CI/CD pipeline
- Dark mode als standaard
- Mobile responsive (44px touch targets, 16px inputs)

---

## 🔑 KEY COMPONENTS EXPLAINED

### SpelerProfielPage
**Route:** `/spelers/:naam` (naam = lowercase, bijv. 'stan')
**Belangrijk:** naam uit URL wordt gecapitalized voor database queries
```typescript
const spelerNaam = naam.charAt(0).toUpperCase() + naam.slice(1); // 'stan' → 'Stan'
const profile = profiles.find(p => p.speler_naam?.toLowerCase() === naam);
```

**Bewerken knop:** Alleen zichtbaar als `kanBewerken = true`
```typescript
const isEigenProfiel = authProfile?.speler_naam?.toLowerCase() === naam;
const isAdmin = authProfile?.role === 'admin';
const kanBewerken = isEigenProfiel || isAdmin;
```
**Let op:** Bewerken knop heeft witte stijl (geen `btn-secondary`) want die is onzichtbaar op rode hero achtergrond.

### useProfiles Hook
- `useProfiles()` — alle spelerprofielen (profiles met `speler_naam` ingevuld)
- `useReviews(spelerNaam)` — reviews + gemiddelde + `addReview` functie
- `useUpdateProfile()` — update rugnummer/positie/bio
- `addReview(score, commentaar, reviewerNaam)` — voegt review toe met IP check via `api.ipify.org`

### useStats Hooks
- `useStats()` — laadt alle `speler_stats` en aggregeert per speler
- `useFilteredStats(filter)` — gefilterde stats per wedstrijdtype (`all`, `competitie`, `beker`)
- `useSpelerForm(spelerNaam)` — laadt de laatste 5 gespeelde wedstrijden voor een speler, gebruikt voor de vormindicator

**Review spam bescherming:**
- Voordat een review wordt opgeslagen, haalt `useReviews.addReview` het publieke IP op van de bezoeker via `https://api.ipify.org?format=json`
- Controleert of er in het laatste uur al een review bestaat met hetzelfde IP voor dezelfde speler

### SpelerProfielPage UI Helpers
- `StarRating` — custom 1-5 star rating component met hover en readonly modes
- `FormIndicator` — laatste 5 gespeelde wedstrijden als verticale bar chart met doelpunten en tegenstander
- `BestePrestatie` — seizoenhoogtepunten zoals topscorer, aanwezigheid en goals-per-wedstrijd

### SpelerKoppelingPanel
**Locatie:** `src/components/Admin/SpelerKoppelingPanel.tsx`
**Werking:**
1. Laadt alle accounts uit `profiles` tabel
2. Admin kiest via dropdown welke speler bij welk account hoort
3. Bij wijziging: verwijdert eerst oude koppeling voor die speler, dan nieuwe instellen

### AdminPage (v2.5)
AdminPage is momenteel opgebouwd uit drie tabs:
- **Speler Koppelingen** — `SpelerKoppelingPanel`
- **Reviews** — `ReviewModeratie`, inclusief review filtering en review verwijdering
- **Gebruikers** — `UserBeheer`, met rolwijzigingen (`admin` / `speler`) en profielverwijdering

**Let op:** ReviewModeratie ondersteunt filteren op spelernaam en laat admins reviews verwijderen.

### useAuth refreshProfile
```typescript
const refreshProfile = async () => {
  if (!user) return;
  await loadProfile(user.id);
};
```
Aanroepen na koppeling of profielwijziging zodat context up-to-date is.

### Supabase Auth Helpers
**Locatie:** `src/lib/supabase.ts`
- `auth.signIn(email, password)`
- `auth.signUp(email, password, fullName)`
  - maakt automatisch een `profiles` record met `role: 'speler'`
- `auth.signOut()`
- `auth.getProfile(userId)`
- `auth.isAdmin()`

Deze helper wrapper centraliseert login/signup en profiel-fetchen voor de app.

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Roles
- **speler:** Kan stats bekijken, eigen profiel bewerken (indien gekoppeld)
- **admin:** Kan alles + speler koppelingen beheren

### Profiel Koppeling Flow
```
Admin → AdminPage → tab "Speler Koppelingen"
  ↓
Dropdown: account 'stanholv@gmail.com' = speler 'Stan'
  ↓
profiles.speler_naam = 'Stan' in Supabase
  ↓
useAuth laadt profiel opnieuw (refreshProfile)
  ↓
isEigenProfiel = true → Bewerken knop zichtbaar
```

### Protected Routes
- `/wedstrijd-invoeren` — Requires authentication
- `/admin` — Requires admin role

---

## 🗺️ ROUTES

| Route | Component | Toegang |
|-------|-----------|---------|
| `/` | HomePage | Publiek |
| `/statistieken` | StatsPage | Publiek |
| `/statistieken/details` | DetailedStatsPage | Publiek |
| `/uitslagen` | UitslagenPage | Publiek |
| `/uitslagen/:id` | WedstrijdDetailPage | Publiek |
| `/spelers` | SpelersPage | Publiek |
| `/spelers/:naam` | SpelerProfielPage | Publiek (bewerken = gekoppeld/admin) |
| `/login` | LoginForm | Publiek |
| `/wedstrijd-invoeren` | WedstrijdForm | Ingelogd |
| `/admin` | AdminPage | Admin |

---

## 🗄️ DATA FLOW

### Review Toevoegen Flow
```
SpelerProfielPage → reviewFormulier
  ↓
addReview(score, commentaar, reviewerNaam)
  ↓
1. IP ophalen via https://api.ipify.org?format=json
2. Check: reviews in laatste uur voor dit IP + speler
3. Als ok: insert in reviews tabel
4. Refresh reviews lokaal
```

> Let op: IP-gebaseerde spam bescherming werkt het best in productie; proxies/VPNs kunnen hetzelfde IP delen.

### Profiel Bewerken Flow
```
SpelerProfielPage → bewerken knop (kanBewerken = true)
  ↓
Formulier: rugnummer, bio
  ↓
updateProfile(profileId, data)
  ↓
UPDATE profiles SET rugnummer=..., bio=... WHERE id=...
  ↓
refreshProfile() in useAuth
```

> Let op: profiel bewerken voor gekoppelde spelers of admins only.
---

## 🚀 DEPLOYMENT

### Environments
- **Development:** http://localhost:3000
- **Production:** https://ultrawear-indoor.vercel.app
- **Preview (WIP branch):** Automatisch aangemaakt door Vercel per branch

### Git Workflow
```bash
# Feature branch (huidige v2.5 WIP)
git checkout feature/player-profiles
git add .
git commit -m "beschrijving"
git push  # → Vercel preview URL

# Naar productie mergen
git checkout main
git merge feature/player-profiles
git push  # → Vercel deployt naar productie
```

### Environment Variables
```env
VITE_SUPABASE_URL=https://ziuwzvlttdzegmvsdiim.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Key Dependencies
- `@supabase/supabase-js` ^2.39.3 — database client
- `framer-motion` ^11.18.2 — animaties en page transitions
- `lucide-react` ^0.263.1 — icons
- `sonner` ^1.7.4 — toast notifications
- `@vercel/analytics` ^1.6.1 — production monitoring
- `react-router-dom` ^6.21.3 — routing
- `recharts` ^2.10.3 — grafieken/kant-en-klare visualisatie componenten (geïnstalleerd)
- `typescript` ^5.3.3 — strict typing

### Deployment Headers
`vercel.json` stelt deze security headers in voor alle routes:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

---

## 📊 STATISTIEKEN LOGICA

### Stats Aggregatie (useStats)
```typescript
// CORRECT: alleen tellen waar aanwezig = true
if (stat.aanwezig) {
  aggregated[stat.speler_naam].aanwezig += 1;
  aggregated[stat.speler_naam].doelpunten += stat.doelpunten || 0;
}

// CORRECT: totaal wedstrijden
const totalMatches = wedstrijden.filter(w => w.uitslag && w.uitslag !== '-').length;
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
@media (max-width: 480px) { ... }  /* Mobile */
@media (max-width: 768px) { ... }  /* Tablet */
@media (min-width: 769px) { ... }  /* Desktop */
```

---

## 🐛 BEKENDE ISSUES & FIXES

### Bewerken knop onzichtbaar op rode hero
**Oorzaak:** `btn-secondary` class is wit/transparant op rode achtergrond
**Fix:** Inline stijl met `background: rgba(255,255,255,0.2)` en witte tekst

### authProfile.speler_naam leeg na koppeling
**Oorzaak:** Profiel gecached van voor koppeling
**Fix:** Uitloggen en opnieuw inloggen, of `refreshProfile()` aanroepen

### IP check werkt niet lokaal
**Oorzaak:** api.ipify.org geeft lokaal soms ander IP
**Fix:** Normaal gedrag op productie (Vercel)

---

## 🗺️ ROADMAP

### ✅ v2.2 - Jersey Theme + Stats
### ✅ v2.3 - Uitslagen + Detail pagina
### ✅ v2.4 - Security + GitHub CI/CD + Vercel Analytics
### ✅ v2.5 - Player Profiles & Reviews
- ✅ Spelers overzichtspagina
- ✅ Speler profielpagina
- ✅ Reviews systeem
- ✅ Admin: speler koppeling
- ✅ Klikbare spelersnamen in stats
- ✅ Bewerken knop fix (wit/transparant op rode hero)
- ✅ Form indicator (laatste 5 wedstrijden bar chart)
- ✅ Seizoen hoogtepunten (topscorer, aanwezigheid%, goals/wedstrijd)
- ✅ Review moderatie in AdminPage (tonen + verwijderen)
- ✅ Stripe pattern fix (inputs niet meer bedekt door stripes)
- ✅ Positie veld verwijderd (niet relevant voor zaalvoetbal)

### v2.6 - Review Moderatie & Moderatieverbetering
- Admin kan reviews zien, filteren en verwijderen
- Reviews tab in AdminPage is actief
- Volgende stap: rapporteer knop en moderatie workflow voor bezoekers

### v2.7 - Security Audit
- RLS policy review
- Input sanitization
- Rate limiting
- OWASP compliance

### v2.8 - Season Management
- Multiple seasons support
- Season selector dropdown
- Historical data

### v2.9 - Fan Profiles (TBD)
- Read-only fan accounts
- Match predictions
- Voting system

---

## 🧪 TESTING CHECKLIST

### Voor Deploy
- [ ] `npm run build` slaagt
- [ ] `/spelers` laadt correct, alfabetisch gesorteerd
- [ ] `/spelers/:naam` toont profiel + stats + reviews
- [ ] Bewerken knop zichtbaar voor admin/gekoppelde speler
- [ ] Review formulier: naam verplicht, score verplicht
- [ ] Admin koppeling werkt (account → speler)
- [ ] Spelersnamen in StatsTable zijn klikbaar
- [ ] Navigation toont Spelers tab

---

## 📝 CODING STANDARDS

### File Naming
- Components: PascalCase (SpelersPage.tsx)
- Hooks: camelCase met 'use' prefix (useProfiles.ts)
- Utils: camelCase (copy.ts, types.ts)

### Import Paden vanuit src/pages/
```typescript
import { useStats } from '../hooks/useStats';      // ✅
import { useStats } from '../../hooks/useStats';    // ❌ (te diep)
```

### Import Paden vanuit src/components/
```typescript
import { useStats } from '../../hooks/useStats';   // ✅
```

### TypeScript
- Altijd interfaces voor props
- Geen `any` tenzij noodzakelijk
- Export types uit lib/types.ts

---

## 📞 SUPPORT & RESOURCES

### Key Files
- `src/lib/copy.ts` — alle teksten
- `src/lib/types.ts` — type definities
- `src/hooks/useStats.ts` — stats logica
- `src/hooks/useProfiles.ts` — profiel & review logica
- `src/hooks/useAuth.tsx` — auth context met refreshProfile

### Common Tasks
- **Nieuwe speler toevoegen:** SPELERS array in `src/lib/types.ts`
- **Tekst aanpassen:** COPY object in `src/lib/copy.ts`
- **Profiel koppelen:** Admin → /admin → Speler Koppelingen
- **Review modereren:** v2.6 (nog niet geïmplementeerd)

---

**Last Updated:** April 9, 2026
**Version:** v2.5 (Current/Stable)
**Status:** ✅ Released (main branch)
