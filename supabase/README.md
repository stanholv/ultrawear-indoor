# Database (Supabase)

De app gebruikt één Supabase-project: **Ultrawear Indoor**
(ref `ziuwzvlttdzegmvsdiim`, regio eu-west-3, gratis plan).
Dashboard: https://supabase.com/dashboard/project/ziuwzvlttdzegmvsdiim

| Bestand | Wat |
|---|---|
| `schema.sql` | Het volledige, actuele schema (uit de live database gehaald). Hiermee bouw je een nieuw project op. |
| `opschoning-voorstel.sql` | Kleine veiligheids- en opruimfixes, **nog niet uitgevoerd**. Zie onderaan. |
| `history/` | De oude losse `supabase-*.sql` patches, alleen nog als naslag. |

## Waarom het project steeds gepauzeerd werd

Supabase pauzeert een project op het gratis plan na **7 dagen zonder
database-activiteit**. Wij spelen om de 10 tot 21 dagen, en tussen twee
wedstrijden opent bijna niemand de app. Daardoor ging het project geregeld
op pauze. Een gepauzeerd project wordt niet vanzelf wakker: iemand moet het
in het dashboard herstellen.

## De oplossing: keep-alive

Elke dag doet de app één kleine leesquery op de database, zodat die nooit
7 dagen stil ligt.

1. **Vercel Cron (hoofdroute).** `vercel.json` roept elke dag rond 04:17 UTC
   `/api/keepalive` aan (`api/keepalive.ts`). Die functie gebruikt dezelfde
   `VITE_SUPABASE_URL` en `VITE_SUPABASE_ANON_KEY` als de site, dus je hoeft
   niets in te stellen. Te volgen in Vercel → Project → Settings → Cron Jobs.
2. **GitHub Action (reserve + alarm).** `.github/workflows/keepalive.yml`
   roept hetzelfde endpoint om de twee dagen aan. Lukt dat niet (de database
   antwoordt niet, of het project is toch gepauzeerd), dan faalt de job en
   **mailt GitHub de repo-eigenaar**. Zo hoor je het vóór de ploeg het merkt.
   GitHub schakelt geplande workflows uit na 60 dagen zonder commits. Je
   krijgt daar vooraf een mail over, en met "Enable workflow" staat hij weer aan.

Handmatig testen: open https://ultrawear-indoor.vercel.app/api/keepalive.
Dat geeft `{"ok":true,...}` terug.

**Optioneel: endpoint afschermen.** Zet in Vercel een env var `CRON_SECRET`
(een willekeurige string) en voeg dezelfde waarde toe als GitHub-secret
`CRON_SECRET` (Repo → Settings → Secrets → Actions). Vercel Cron stuurt hem
automatisch mee. Zonder `CRON_SECRET` staat het endpoint open. Dat is
onschuldig, want het doet alleen één leesquery.

## Is het project toch gepauzeerd?

Dashboard → project → **Restore project**. Dat duurt een paar minuten en er
gaan geen gegevens verloren. Een gepauzeerd project kan maximaal 90 dagen
hersteld worden; laat het dus niet liggen.

## Back-up

Het gratis plan biedt geen downloadbare back-ups. Maak er af en toe zelf één
(bv. bij elke seizoenswissel). Neem de connection string uit Dashboard →
Connect → *Session pooler* en run lokaal (Docker is niet nodig met `--db-url`):

```bash
export SUPABASE_DB_URL='postgresql://postgres.ziuwzvlttdzegmvsdiim:<wachtwoord>@aws-0-eu-west-3.pooler.supabase.com:5432/postgres'
npx supabase db dump --db-url "$SUPABASE_DB_URL" -f backups/schema.sql
npx supabase db dump --db-url "$SUPABASE_DB_URL" --data-only -s public,auth -f backups/data.sql
```

`backups/` staat in `.gitignore`. De data bevat adressen, geboortedata en
telefoonnummers van leden, dus **nooit committen** (de repo is publiek
leesbaar voor wie toegang heeft). Bewaar de map bv. in een privé Google Drive.

## Schema aanpassen

1. Voer de wijziging uit in de SQL Editor.
2. Werk `schema.sql` bij (met de hand, of opnieuw genereren met het
   `db dump`-commando hierboven zonder `--data-only`).
3. Commit beide samen met de code die de wijziging gebruikt.

## Openstaande punten (gevonden bij de review van november 2026)

**Klaar om uit te voeren:** `opschoning-voorstel.sql`. Het bestand is lokaal
getest op een kopie van het schema en verandert niets aan wat je in de app ziet:

- dubbele `updated_at`-trigger op `wedstrijden` weg;
- twee waarschuwingen van de Supabase Security Advisor opgelost;
- de open INSERT-policy op `reviews` weg. Nu kan iedereen met de publieke
  anon key de rate limit van `submit_review()` omzeilen door rechtstreeks
  te inserten.

**Privacy (vraagt ook een code-aanpassing):**

- `profiles` is voor iedereen leesbaar (`select *` op de spelerspagina), dus
  ook de **e-mailadressen** van alle accounts zijn via de publieke API op te
  vragen.
- `reviews` is voor iedereen leesbaar, inclusief de kolom **`ip_adres`**.

Fix: de publieke queries alleen de nodige kolommen laten opvragen, en in de
database de leesrechten op `email` en `ip_adres` intrekken voor de rollen
`anon`/`authenticated` (admins via een `SECURITY DEFINER`-functie).

**Ongebruikt:** tabel `seizoenen`, view `speler_totalen` en de kolommen
`wedstrijden.seizoen_id`, `profiles.shirt_number`, `profile_photo_url` en
`facebook_url`. Ze zijn onschuldig en kunnen bij een volgende opruimbeurt weg.

## Waarom (nog) niet overstappen naar iets anders?

Overwogen in november 2026. De database is klein (13 MB, 9 accounts, ±50
wedstrijden per seizoen), dus elke gratis dienst kan de data aan. Het enige
probleem was de pauze, en die lost de keep-alive op. Een overstap zou meer
kosten dan hij oplevert:

- **Neon** (gratis Postgres) pauzeert ook, maar wordt bij een request vanzelf
  in een fractie van een seconde wakker. Er is echter geen login-systeem en
  geen automatische REST-API met row level security. We zouden zelf een
  backend en authenticatie moeten bouwen, en de 9 accounts plus alle
  `RLS`-regels moeten overzetten.
- **Firebase / PocketBase / Cloudflare D1**: dat komt neer op het herschrijven
  van alle data-hooks, de login en de beveiliging. Bij PocketBase komt er ook
  een eigen server bij om te onderhouden.
- **Supabase Pro** (±$25/maand) pauzeert nooit en heeft dagelijkse back-ups.
  Dat is de eenvoudige uitweg als de keep-alive ooit niet volstaat.

Mocht een overstap later toch nodig zijn, dan is `schema.sql` plus een
`db dump` van de data het vertrekpunt: het is gewone Postgres.
