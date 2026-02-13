# 🚀 Upgrade Guide v1.0 → v2.0

## Overzicht

Deze guide helpt je om je bestaande Ultrawear Indoor app te upgraden naar de moderne v2.0.

## ⚡ Quick Upgrade (Aanbevolen)

### Stap 1: Backup (Optioneel)

Je huidige app blijft gewoon werken. De v2.0 kan naast v1.0 draaien of het vervangen.

### Stap 2: Update Code

**Optie A: Nieuwe Repository (Cleanest)**
```bash
# Maak nieuwe repo aan
cd ~/Projects
mkdir ultrawear-indoor-v2
cd ultrawear-indoor-v2

# Unzip de nieuwe code hierin
# Kopieer .env.local van oude project
cp ../ultrawear-indoor/.env.local .

# Installeer dependencies
npm install

# Test lokaal
npm run dev

# Push naar nieuwe GitHub repo
git init
git add .
git commit -m "Upgrade to v2.0"
git remote add origin https://github.com/stanholv/ultrawear-indoor-v2.git
git push -u origin main

# Deploy op Vercel als nieuw project
```

**Optie B: Update Bestaande Repo (Snelst)**
```bash
cd ~/Projects/ultrawear-indoor

# Maak backup branch
git checkout -b v1-backup
git push origin v1-backup

# Terug naar master
git checkout master

# Verwijder oude code (BEHALVE .env.local!)
# Bewaar .env.local!
rm -rf src/*
rm -rf public/*

# Unzip nieuwe v2.0 code
# Kopieer alle files BEHALVE .env.example

# Check .env.local (moet nog steeds bestaan)
cat .env.local

# Installeer nieuwe dependencies
npm install

# Test
npm run dev

# Als het werkt, commit
git add .
git commit -m "Upgrade to v2.0 - Modern design"
git push

# Vercel deploy automatisch!
```

### Stap 3: Test Alles

✅ Dark mode toggle werkt
✅ Login/logout werkt
✅ Statistieken tonen correct
✅ Wedstrijd invoeren werkt
✅ Animaties zijn smooth
✅ Mobile responsive

## 📋 Wat Blijft Hetzelfde

- ✅ Database (Supabase) - geen wijzigingen
- ✅ Environment variables - zelfde setup
- ✅ Authentication - zelfde flow
- ✅ RLS Policies - onveranderd
- ✅ Deployment - zelfde process

## 🎨 Wat is Nieuw

### Dependencies
```json
{
  "framer-motion": "^11.0.3",    // Animaties
  "lucide-react": "^0.263.1",    // Icons
  "recharts": "^2.10.3",         // Charts (toekomstig)
  "sonner": "^1.3.1"             // Toast notifications
}
```

### Nieuwe Files
```
src/
  components/
    Stats/
      StatsOverview.tsx          // NEW - Dashboard cards
    UI/
      (toekomstige UI components)
  styles/
    globals.css                  // UPDATED - Dark mode + nieuwe styles
```

### Updated Files
```
src/
  components/
    Layout/
      Header.tsx                 // Dark mode toggle
      Navigation.tsx             // Icons toegevoegd
    Auth/
      LoginForm.tsx              // Modern design
    Stats/
      StatsTable.tsx             // Rankings + animaties
    Wedstrijden/
      WedstrijdForm.tsx          // Live preview
  App.tsx                        // Toaster toegevoegd
```

## 🔧 Configuratie Updates

### package.json
Nieuwe dependencies worden automatisch geïnstalleerd met `npm install`.

### tsconfig.json
Geen wijzigingen nodig.

### vite.config.ts
Geen wijzigingen nodig.

## 🎯 Feature Highlights

### 1. Dark Mode
```typescript
// Automatisch opgeslagen in localStorage
// Toggle in header rechtsboven
```

### 2. Stats Overview
```typescript
// Nieuwe dashboard cards bovenaan stats pagina
// Toont: Totaal wedstrijden, goals, gemiddelde, topscorer
```

### 3. Animated Rankings
```typescript
// Leaderboard met:
// - Gouden/zilveren/bronzen medailles voor top 3
// - Animated progress bars
// - Player avatars
```

### 4. Toast Notifications
```typescript
// Bij acties:
toast.success('Wedstrijd opgeslagen! 🎉');
toast.error('Er ging iets mis');
```

### 5. Live Stats Preview
```typescript
// Real-time overzicht tijdens wedstrijd invoeren
// Telt automatisch aanwezigen, goals, etc.
```

## 🐛 Troubleshooting

### "Module not found: framer-motion"
```bash
npm install framer-motion lucide-react sonner
```

### "Dark mode werkt niet"
Check browser localStorage:
```javascript
// Open Console
localStorage.getItem('theme')
// Moet 'light' of 'dark' zijn
```

### "Animaties zijn traag"
Check browser/OS "Reduce Motion" settings.
Of disable in code:
```css
/* In globals.css */
* { animation: none !important; }
```

### "Build fails"
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

## 📊 Performance

v2.0 is sneller dan v1.0 dankzij:
- Code splitting
- Lazy loading components
- Optimized re-renders
- CSS variables voor snellere theme switch

## 🔄 Rollback (Als Nodig)

Als v2.0 problemen geeft:

```bash
# Optie A: Terug naar v1 backup branch
git checkout v1-backup
git push origin master --force

# Optie B: Revert laatste commit
git revert HEAD
git push

# Vercel deploy automatisch de oude versie
```

## ✅ Checklist

Voltooi deze stappen:

- [ ] Backup gemaakt (optioneel)
- [ ] Nieuwe code gedownload
- [ ] .env.local gekopieerd
- [ ] npm install uitgevoerd
- [ ] Lokaal getest (npm run dev)
- [ ] Dark mode getest
- [ ] Alle features getest
- [ ] Gepushed naar GitHub
- [ ] Vercel deployment succesvol
- [ ] Live site getest
- [ ] Team geïnformeerd over nieuwe features

## 🎉 Post-Upgrade

### Informeer Je Team
```
Hey team! 🎉

De app heeft een upgrade gekregen naar v2.0!

Nieuwe features:
✨ Dark mode (klik maan-icoon rechtsboven)
📊 Moderne dashboard met stats overview
🏆 Animated rankings met medailles
⚡ Snellere loading
📱 Betere mobile experience

Probeer het uit en laat weten wat je ervan vindt!

Zelfde login, alles werkt hetzelfde maar ziet er mooier uit 😊
```

### Monitor
- Check Vercel analytics voor errors
- Test alle flows nogmaals
- Vraag feedback van gebruikers

## 🚀 Next Steps

Nu je v2.0 hebt:

1. **Verken nieuwe features**
   - Toggle dark mode
   - Check de nieuwe dashboard
   - Bekijk de rankings

2. **Customization**
   - Pas kleuren aan in globals.css
   - Upload team logo (toekomstig)

3. **Data Import**
   - Importeer oude Google Sheets data
   - Zie IMPORT_GUIDE.md (volgende stap!)

## 💡 Tips

- **Dark mode**: Perfect voor avondwedstrijden
- **Live preview**: Check scores terwijl je invult
- **Toast notifications**: Mis geen confirmaties meer
- **Progress bars**: Zie in één oogopslag wie topper is

Geniet van de nieuwe app! ⚽🎉
