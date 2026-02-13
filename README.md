# ⚽ Ultrawear Indoor - Modern Edition

Volledig vernieuwde minivoetbal app met moderne UI, animaties en verbeterde UX.

## ✨ Wat is Nieuw in v2.0

### 🎨 Design Upgrades
- **Glassmorphism** - Modern frosted glass effect
- **Dark Mode** - Volledige dark mode ondersteuning met toggle
- **Gradient Accents** - Mooie kleurovergangen
- **Smooth Animaties** - Framer Motion powered transitions
- **Responsive Grid Layout** - Verbeterde mobile experience

### 📊 Nieuwe Features  
- **Stats Overview Cards** - Quick metrics dashboard
- **Interactive Rankings** - Animated leaderboard met medailles
- **Progress Bars** - Visuele weergave van statistieken
- **Player Avatars** - Auto-generated avatars met initialen
- **Trend Indicators** - Up/down trends voor stats
- **Toast Notifications** - Moderne feedback messages
- **Skeleton Loaders** - Smooth loading states

### 🎯 UX Verbeteringen
- **Live Stats Preview** - Real-time overzicht tijdens invoeren
- **Form Validation** - Betere error handling
- **Icon Integration** - Lucide icons overal
- **Keyboard Shortcuts** - Sneller werken
- **Auto-save Indicators** - Duidelijke feedback

## 🚀 Quick Start

```bash
# Installeer dependencies
npm install

# Start development server
npm run dev

# Build voor productie
npm run build
```

## 📦 Nieuwe Dependencies

- `framer-motion` - Smooth animaties
- `lucide-react` - Moderne icon library
- `recharts` - Charts en grafieken (voor toekomstige features)
- `sonner` - Toast notifications

## 🎨 Theme Systeem

De app ondersteunt nu dark mode! De theme wordt automatisch opgeslagen in localStorage.

```typescript
// Toggle theme programmatisch
const toggleTheme = () => {
  const newTheme = theme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  localStorage.setItem('theme', newTheme);
  document.documentElement.setAttribute('data-theme', newTheme);
};
```

## 🎯 Component Overzicht

### Nieuwe Componenten
- `StatsOverview` - Dashboard met quick stats
- `ModernStatsTable` - Verbeterde tabel met rankings
- `ThemeToggle` - Dark/Light mode switch
- `PlayerAvatar` - Auto-generated avatars
- `ProgressBar` - Animated progress indicators

### Verbeterde Componenten
- `Header` - Moderne header met theme toggle
- `Navigation` - Icons en betere states
- `LoginForm` - Glassmorphism design
- `WedstrijdForm` - Live stats preview

## 🔧 Customization

### Kleuren Aanpassen

Edit `/src/styles/globals.css`:

```css
:root {
  --color-primary: #dc2626;     /* Rood */
  --color-accent: #f59e0b;      /* Oranje */
  /* Pas aan naar jouw kleuren */
}
```

### Spelers Toevoegen

Edit `/src/lib/types.ts`:

```typescript
export const SPELERS = [
  "Stan", "Rette", "Wanny", // ... je spelers
  "NieuweSpeler" // voeg toe
];
```

## 📊 Toekomstige Features (Roadmap)

- [ ] **Charts & Grafieken** - Visuele statistieken met Recharts
- [ ] **Player Profiles** - Individuele speler pagina's
- [ ] **Match History** - Complete wedstrijd geschiedenis
- [ ] **Comparison Tool** - Vergelijk spelers
- [ ] **Export Data** - Download als CSV/PDF
- [ ] **Notifications** - Push notifications voor nieuwe wedstrijden
- [ ] **Team Management** - Meerdere teams ondersteunen
- [ ] **Seasonal Stats** - Statistieken per seizoen

## 🎨 Design System

### Spacing Scale
```
--spacing-xs:  4px
--spacing-sm:  8px
--spacing-md:  16px
--spacing-lg:  24px
--spacing-xl:  32px
--spacing-2xl: 48px
```

### Border Radius
```
--radius-sm:   6px
--radius-md:   12px
--radius-lg:   16px
--radius-xl:   24px
--radius-full: 9999px
```

### Shadows
```
--shadow-sm: Subtle
--shadow-md: Medium
--shadow-lg: Large
--shadow-xl: Extra Large
```

## 🔐 Beveiliging

Alle security features van v1.0 blijven behouden:
- Row Level Security (RLS) in Supabase
- Role-based access control
- Environment variables voor credentials
- HTTPS/SSL via Vercel/Netlify

## 📱 Progressive Web App (PWA)

De app is PWA-ready! Gebruikers kunnen de app installeren op hun apparaat voor een native app ervaring.

## 🐛 Troubleshooting

### Dark Mode Werkt Niet
Check of `localStorage` werkt in je browser. Open Console:
```javascript
localStorage.setItem('theme', 'dark');
```

### Animaties Zijn Traag
Reduce motion in OS instellingen kan animaties uitschakelen. Check:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; }
}
```

### Icons Laden Niet
Check of `lucide-react` correct is geïnstalleerd:
```bash
npm install lucide-react
```

## 📝 Migration Guide (v1.0 → v2.0)

### Database Schema
✅ Geen wijzigingen! Gebruik dezelfde Supabase setup.

### Environment Variables
✅ Geen wijzigingen! Gebruik dezelfde `.env.local`.

### Deployment
✅ Werkt met bestaande Vercel/Netlify setup.

### Breaking Changes
Geen! De v2.0 is volledig backwards compatible.

## 🎉 Credits

- **Design Inspiration**: Moderne SaaS dashboards
- **Icons**: Lucide Icons
- **Animations**: Framer Motion
- **UI Components**: Custom built
- **Team**: Ultrawear Indoor

## 📄 Licentie

MIT

---

**Gemaakt met ⚽ en 💻 voor Ultrawear Indoor**
