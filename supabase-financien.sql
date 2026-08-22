-- ================================================
-- ULTRAWEAR INDOOR - FINANCIËN (FINANCIAL DEPARTMENT)
-- ================================================
-- Voegt het "financieel departement" toe: leden met administratieve gegevens,
-- een per-seizoen inschrijving (bevestigd + verwacht lidgeld), en een kasboek
-- (inkomsten/uitgaven met categorieën). Alles staat ACHTER de admin-login:
-- lezen én schrijven is admin-only (anders dan wedstrijden/stats die publiek
-- leesbaar zijn).
--
-- Model (afgesproken met de club):
--   * leden            → één rij per persoon (evergreen contactgegevens),
--                        optioneel gekoppeld aan een spelers-rij (rooster).
--   * fin_categorieen  → uitbreidbare categorieën, richting 'in' of 'uit';
--                        precies één is gemarkeerd als lidgeld-categorie.
--   * inschrijvingen   → per lid per seizoen: bevestigd + verwacht lidgeld.
--                        "Wie moet nog betalen" = verwacht_lidgeld − som van
--                        lidgeld-transacties voor dat lid/seizoen.
--   * fin_transacties  → het kasboek. Elke geldbeweging is één rij met een
--                        categorie (die de richting bepaalt), bedrag, datum,
--                        optioneel gekoppeld lid (bv. lidgeld of lening).
--   * fin_seizoenen    → startsaldo per seizoen. Saldo = startsaldo + inkomsten
--                        − uitgaven (in de app berekend).
--
-- Persoonsgegevens (adres/geboortedatum/telefoon van de 14 leden) zitten NIET
-- in dit bestand — die staan in supabase-financien-seed.sql (git-ignored), zodat
-- er geen echte adressen in de repo terechtkomen.
--
-- Idempotent: veilig om opnieuw te draaien. Draai in één keer (SQL editor).
-- ================================================

-- 0. Zorg dat de admin-helper bestaat (SECURITY DEFINER → leest profiles zonder
--    RLS-recursie te veroorzaken vanuit de policies hieronder).
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ------------------------------------------------
-- 1. LEDEN — persoon + administratieve gegevens
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS leden (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam          TEXT NOT NULL UNIQUE,                 -- volledige naam
  speler_id     UUID REFERENCES spelers(id) ON DELETE SET NULL, -- link naar rooster (optioneel)
  adres         TEXT,
  geboortedatum DATE,
  telefoon      TEXT,
  actief        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_leden_speler ON leden(speler_id);

-- ------------------------------------------------
-- 2. FIN_CATEGORIEEN — uitbreidbare in-/uitgavecategorieën
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS fin_categorieen (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam       TEXT NOT NULL,
  richting   TEXT NOT NULL CHECK (richting IN ('in', 'uit')),
  is_lidgeld BOOLEAN NOT NULL DEFAULT false,          -- markeert de lidgeld-categorie
  volgorde   INTEGER NOT NULL DEFAULT 0,
  actief     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (naam, richting)
);

-- Seed: categorieën uit de Excel-boekhouding (geen persoonsgegevens → mag in git).
INSERT INTO fin_categorieen (naam, richting, is_lidgeld, volgorde) VALUES
  ('Lidgeld',                'in',  true,  1),
  ('Extra',                  'in',  false, 2),
  ('Lening',                 'in',  false, 3),
  ('Sponsoring',             'in',  false, 4),
  ('Bon fairplay',           'in',  false, 5),
  ('Kerstmarkt',             'in',  false, 6),
  ('Varia (in)',             'in',  false, 7),
  ('Zaalhuur / inschrijving','uit', false, 1),
  ('Tornooi',                'uit', false, 2),
  ('Etentje',                'uit', false, 3),
  ('Terugbetaling lening',   'uit', false, 4),
  ('Varia (uit)',            'uit', false, 5)
ON CONFLICT (naam, richting) DO NOTHING;

-- Precies één lidgeld-categorie (guard tegen per ongeluk meerdere).
CREATE UNIQUE INDEX IF NOT EXISTS uniq_fin_lidgeld_categorie
  ON fin_categorieen (is_lidgeld) WHERE is_lidgeld;

-- ------------------------------------------------
-- 3. FIN_SEIZOENEN — startsaldo per seizoen
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS fin_seizoenen (
  seizoen    TEXT PRIMARY KEY,                        -- 'YYYY-YYYY'
  startsaldo NUMERIC(10,2) NOT NULL DEFAULT 0,        -- overgedragen eindsaldo vorig seizoen
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO fin_seizoenen (seizoen, startsaldo) VALUES ('2026-2027', 0)
ON CONFLICT (seizoen) DO NOTHING;

-- ------------------------------------------------
-- 4. INSCHRIJVINGEN — per lid per seizoen
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS inschrijvingen (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lid_id           UUID NOT NULL REFERENCES leden(id) ON DELETE CASCADE,
  seizoen          TEXT NOT NULL,
  bevestigd        BOOLEAN NOT NULL DEFAULT false,    -- speelt dit seizoen mee
  verwacht_lidgeld NUMERIC(10,2),                     -- af te spreken inschrijvingsgeld
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (lid_id, seizoen)
);
CREATE INDEX IF NOT EXISTS idx_inschrijvingen_seizoen ON inschrijvingen(seizoen);

-- ------------------------------------------------
-- 5. FIN_TRANSACTIES — het kasboek
-- ------------------------------------------------
CREATE TABLE IF NOT EXISTS fin_transacties (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seizoen      TEXT NOT NULL,
  datum        DATE NOT NULL DEFAULT CURRENT_DATE,
  categorie_id UUID NOT NULL REFERENCES fin_categorieen(id) ON DELETE RESTRICT,
  bedrag       NUMERIC(10,2) NOT NULL CHECK (bedrag > 0),
  lid_id       UUID REFERENCES leden(id) ON DELETE SET NULL,  -- bv. lidgeld/lening per persoon
  omschrijving TEXT,
  created_by   UUID DEFAULT auth.uid() REFERENCES auth.users,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_fin_transacties_seizoen ON fin_transacties(seizoen);
CREATE INDEX IF NOT EXISTS idx_fin_transacties_lid ON fin_transacties(lid_id);
CREATE INDEX IF NOT EXISTS idx_fin_transacties_categorie ON fin_transacties(categorie_id);

-- ================================================
-- 6. ROW LEVEL SECURITY — admin-only lezen én schrijven
-- ================================================
-- Eén FOR ALL-policy per tabel dekt SELECT/INSERT/UPDATE/DELETE: zonder aparte
-- WITH CHECK gebruikt Postgres de USING-expressie ook voor inserts/updates.
ALTER TABLE leden           ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_categorieen ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_seizoenen   ENABLE ROW LEVEL SECURITY;
ALTER TABLE inschrijvingen  ENABLE ROW LEVEL SECURITY;
ALTER TABLE fin_transacties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leden alleen voor admins" ON leden;
CREATE POLICY "Leden alleen voor admins" ON leden
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Categorieen alleen voor admins" ON fin_categorieen;
CREATE POLICY "Categorieen alleen voor admins" ON fin_categorieen
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Fin-seizoenen alleen voor admins" ON fin_seizoenen;
CREATE POLICY "Fin-seizoenen alleen voor admins" ON fin_seizoenen
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Inschrijvingen alleen voor admins" ON inschrijvingen;
CREATE POLICY "Inschrijvingen alleen voor admins" ON inschrijvingen
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Transacties alleen voor admins" ON fin_transacties;
CREATE POLICY "Transacties alleen voor admins" ON fin_transacties
  FOR ALL USING (is_admin());

-- ================================================
-- DONE. Draai daarna supabase-financien-seed.sql (git-ignored) om de 14 leden
-- met hun gegevens + inschrijvingen voor 2026-2027 toe te voegen.
--
-- Verifieer:
--   SELECT naam, richting, is_lidgeld FROM fin_categorieen ORDER BY richting, volgorde;
--   SELECT COUNT(*) FROM leden;
-- ================================================
