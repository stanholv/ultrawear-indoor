# ⚡ Quick Setup Checklist

Volg deze stappen in volgorde voor een snelle setup:

## ✅ Pre-Requirements
- [ ] Node.js 18+ geïnstalleerd
- [ ] Git geïnstalleerd
- [ ] Code editor (VS Code aanbevolen)

## 1️⃣ Supabase Setup (10 min)
- [ ] Account aanmaken op supabase.com
- [ ] Nieuw project: "ultrawear-indoor"
- [ ] Database schema uitvoeren (supabase-schema.sql)
- [ ] Eerste admin user aanmaken via Auth UI
- [ ] Admin rol toekennen in profiles tabel
- [ ] API credentials kopiëren (URL + anon key)

## 2️⃣ Lokale Setup (5 min)
```bash
# Clone repository
git clone [jouw-repo-url]
cd ultrawear-indoor

# Installeer dependencies
npm install

# Environment variables
cp .env.example .env.local
# Edit .env.local met je Supabase credentials

# Start development server
npm run dev
```

## 3️⃣ Test Lokaal (5 min)
- [ ] Open http://localhost:3000
- [ ] Log in met admin account
- [ ] Test wedstrijd invoeren
- [ ] Check statistieken pagina
- [ ] Test uitloggen en weer inloggen

## 4️⃣ GitHub Setup (5 min)
```bash
# Maak nieuwe GitHub repository aan
# Push je code
git remote add origin [jouw-github-url]
git add .
git commit -m "Initial commit"
git push -u origin main
```

## 5️⃣ Netlify Deployment (10 min)
- [ ] Account aanmaken op netlify.com
- [ ] New site from Git
- [ ] Koppel GitHub repository
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables toevoegen:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] Deploy!
- [ ] Test live site

## 🎉 Klaar!

Totale tijd: ~35 minuten

Je app is nu live op: `https://[jouw-site].netlify.app`

## 📝 Volgende Stappen

1. Vertel je team over de nieuwe app
2. Deel de URL
3. Geef andere mensen admin rechten (via Supabase profiles tabel)
4. Start met data invoeren!

## 🆘 Hulp Nodig?

Check de volledige README.md voor:
- Gedetailleerde instructies
- Troubleshooting
- Extra features
- Best practices
