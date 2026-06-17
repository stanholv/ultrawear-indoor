# ⚽ Ultrawear Indoor v2.5

Indoor voetbal team management app met statistieken, speler profielen, en reviews systeem.

## ✨ Huidige Features (v2.5)

### 👥 Speler Management
- **Spelers Pagina** (`/spelers`) - Overzicht van alle team leden met rugnummers en posities
- **Speler Profielen** (`/spelers/:naam`) - Individuele profielpagina's met statistieken en reviews
- **Profiel Koppelingen** - Admin kan accounts koppelen aan spelers
- **Bewerking Mogelijkheden** - Gekoppelde spelers kunnen hun profiel bewerken (rugnummer, positie, bio)

### ⭐ Reviews Systeem
- **Community Reviews** - Iedereen kan spelers beoordelen (1-5 sterren)
- **Spam Bescherming** - Max 1 review per IP per uur per speler
- **Gemiddelde Score** - Automatisch berekend en weergegeven op profielpagina
- **Transparantie** - Alle reviews publiek zichtbaar met reviewer naam en datum

### 📊 Statistieken
- **Live Stats Dashboard** - Real-time statistieken met filters
- **Ranking Systeem** - Vergeleken op doelpunten, aanwezigheid en wedstrijden gespeeld
- **Match Details** - Volledige wedstrijdgeschiedenis met uitslag and bijzonderheden
- **Individuele Stats** - Per speler doelpunten, corners, penalties getrackt

### 🎨 Design & UX
- **Jersey Theme** - Ultrawear rood/zwart diagonale strepen design
- **Dark Mode Default** - Optimaal voor stadion omgevingen
- **Responsive Layout** - Perfect op desktop, tablet en mobiel
- **Moderne Animaties** - Smooth transitions met Framer Motion
- **Lucide Icons** - Professionele iconen overal

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Stel environment variables in (.env.local)
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...

# Start development server
npm run dev

# Build voor productie
npm run build
```

**Live Production:** https://ultrawear-indoor.vercel.app
**Repository:** https://github.com/stanholv/ultrawear-indoor

## 📦 Key Dependencies

- `@supabase/supabase-js` - Database & authentication
- `@vercel/analytics` - Production monitoring
- `framer-motion` - Smooth animaties en transitions
- `lucide-react` - Moderne icon library
- `sonner` - Toast notifications (feedback messages)
- `react` & `typescript` - Core framework

## 🎨 Design System

### Kleuren Schema (Jersey-Inspired)
- **Primary:** #C8102E (Ultrawear Red)
- **Secondary:** #1A1A1A (Black)
- **Accent:** #f59e0b (Orange/Gold)
- **Keeper:** #f59e0b
- **Verdediger:** #3b82f6
- **Middenvelder:** #10b981
- **Aanvaller:** #C8102E

### Theme Systeem
De app ondersteunt dark mode als standaard met diagonale rode/zwarte stripes pattern.

```typescript
// Kleuren aanpassen in:
// /src/styles/globals.css (CSS variables)
```

### Responsive Design
- Mobile: Max width 480px (44px touch targets)
- Tablet: 480px - 768px
- Desktop: 768px+

## 🎯 Component Overzicht

### Pagina's (Pages)
- `HomePage.tsx` - Homepagina met volgende wedstrijd en top scorers
- `SpelersPage.tsx` - Alfabetisch gesorteerde speler overzicht
- `SpelerProfielPage.tsx` - Individueel speler profiel met stats, bio en reviews
- `StatsPage.tsx` - Statistieken dashboard met filters
- `DetailedStats.tsx` - Uitgebreide statistieken analyse
- `UitslagenPage.tsx` - Match resultaten geschiedenis
- `WedstrijdDetailPage.tsx` - Details van specifieke wedstrijd

### Layout Components
- `Header.tsx` - Hoofd header met verzalking
- `Navigation.tsx` - Tab-gebaseerde navigatie (Thuis, Statistieken, Uitslagen, Spelers)

### Functionaliteit Components
- `AdminPage.tsx` - Admin dashboard (speler koppelingen, reviews)
- `SpelerKoppelingPanel.tsx` - Admin tool om accounts aan spelers te koppelen
- `WedstrijdForm.tsx` - Wedstrijd invoer & beheer (admin)
- `LoginForm.tsx` - Inlog formulier

### Statistieken Components
- `StatsTable.tsx` - Interactieve stats tabel met rankings
- `StatsOverview.tsx` - Quick stats cards

### UI Components
- `MatchTypeBadge.tsx` - Badge voor wedstrijd type
- `NumberInput.tsx` - +/- input voor stats
- `ProtectedRoute.tsx` - Route bescherming voor authenticated users

## �️ Routes Overzicht

| Route | Beschrijving | Toegang |
|-------|-------------|---------|
| `/` | Homepage met volgende wedstrijd | Publiek |
| `/statistieken` | Statistieken dashboard | Publiek |
| `/statistieken/details` | Uitgebreide stats | Publiek |
| `/uitslagen` | Match resultaten | Publiek |
| `/uitslagen/:id` | Wedstrijd details | Publiek |
| `/spelers` | Speler overzicht | Publiek |
| `/spelers/:naam` | Speler profiel & reviews | Publiek |
| `/login` | Inlog pagina | Publiek |
| `/wedstrijd-invoeren` | Wedstrijd invoer | Ingelogd |
| `/admin` | Admin dashboard | Admin only |

## 🔧 Configuratie

### Spelers Toevoegen

Edit [src/lib/types.ts](src/lib/types.ts):

```typescript
export const SPELERS = [
  "Stan", "Rette", "Wanny", "Arne", "Emile",
  "Vik", "Nicolas", "Mats", "Brian", "Slekke",
  "Didier", "Elias", "Toby", "Pieter"
  // Voeg nieuwe spelers toe hier
];
```

### Environment Variables

Create `.env.local`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Teksten Aanpassen

Edit [src/lib/copy.ts](src/lib/copy.ts) voor alle UI teksten.

## 📊 Toekomstige Features (Roadmap)

### v2.6 - Review Moderatie
- [ ] Admin review moderation (bekijken & verwijderen)
- [ ] Spam detection verbeteren
- [ ] Rapporteer knop voor reviews

### v2.7 - Seizoen Management
- [ ] Meerdere seizoenen ondersteuning
- [ ] Seizoen selector dropdown
- [ ] Historische data per seizoen

### v2.8 - Security & Performance
- [ ] RLS policies audit
- [ ] Input sanitization verbeteren
- [ ] Rate limiting configuratie
- [ ] Caching optimaties

### v2.9+ - Toekomstige Expansie
- [ ] Match predictions
- [ ] Team formation builder
- [ ] Fan engagement features
- [ ] Mobile app (React Native)

## 🔐 Beveiliging

- **Row Level Security (RLS)** - Supabase RLS policies op database level
- **Role-based Access** - Admin vs Speler rollen
- **Environment Variables** - Credentials buiten code gehouden
- **HTTPS/SSL** - Vercel hosting met automatische encryption
- **Spam Protection** - IP-based review limiting

## 🚀 Deployment

### Continuous Deployment
- GitHub repo aan Vercel gekoppeld
- Automatische deploy bij push naar `main` branch
- Preview URLs voor feature branches

**Production URL:** https://ultrawear-indoor.vercel.app

## 🐛 Troubleshooting

### Profiel koppeling werkt niet
- Zorg dat je admin bent in Supabase
- Vernieuw pagina na koppeling
- Check browser console voor errors

### Reviews laden niet
- Verifieer Supabase reviews tabel ingesteld
- Check IP detection werkt (api.ipify.org)
- Controleer RLS policies

### Stats tonen 0 waarden
- Zorg dat spelers aanwezig zijn gemarkeerd (True)
- Controleer wedstrijd datum en type
- Check useStats berekeningen

## 📚 Documentatie

Meer details vinden in:
- [PROJECT_KNOWLEDGE_V25.md](PROJECT_KNOWLEDGE_V25.md) - Complete technical reference
- [supabase-schema.sql](supabase-schema.sql) - Database schema
- [SETUP.md](SETUP.md) - Gedetailleerde setup instructies

## 👥 Team

**Ultrawear Indoor** - 14-player indoor soccer team
Stan, Rette, Wanny, Arne, Emile, Vik, Nicolas, Mats, Brian, Slekke, Didier, Elias, Toby, Pieter

## 📄 Licentie

MIT - Open source project

---

**Gemaakt met ⚽ en 💻 voor Ultrawear Indoor**
**Version:** v2.5 | **Last Updated:** April 2026
