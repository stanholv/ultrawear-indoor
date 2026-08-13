-- ================================================
-- ULTRAWEAR INDOOR - SPELERS (ROSTER) TABLE
-- ================================================
-- Moves the team roster out of the hardcoded SPELERS array (src/lib/types.ts)
-- into a table, so players can be added/retired and reordered without a code
-- change. Player *account* details (rugnummer, positie, bio) stay on `profiles`
-- as before — this table is only the roster membership.
--
-- The app falls back to the built-in SPELERS list if this table is empty or
-- missing, so it is safe to deploy the code before running this migration.
--
-- Run once (SQL editor or `supabase db push`).
-- ================================================

-- Zorg dat de admin-helper bestaat (de live DB heeft hem niet altijd). Deze
-- SECURITY DEFINER-functie leest `profiles` zonder RLS-recursie te veroorzaken.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

CREATE TABLE IF NOT EXISTS spelers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  naam TEXT NOT NULL UNIQUE,
  actief BOOLEAN NOT NULL DEFAULT true,       -- inactief = uit huidige selectie, historie blijft
  volgorde INTEGER NOT NULL DEFAULT 0,        -- weergavevolgorde in het formulier/lijst
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed met de huidige selectie (zelfde volgorde als de oude SPELERS-array).
INSERT INTO spelers (naam, volgorde) VALUES
  ('Stan', 1), ('Rette', 2), ('Wanny', 3), ('Arne', 4), ('Emile', 5),
  ('Vik', 6), ('Nicolas', 7), ('Mats', 8), ('Brian', 9), ('Slekke', 10),
  ('Didier', 11), ('Elias', 12), ('Toby', 13), ('Pieter', 14)
ON CONFLICT (naam) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_spelers_actief ON spelers(actief);

-- ------------------------------------------------
-- RLS: public read, admin-only writes (zelfde patroon als wedstrijden/stats).
-- ------------------------------------------------
ALTER TABLE spelers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Spelers zijn zichtbaar voor iedereen" ON spelers;
CREATE POLICY "Spelers zijn zichtbaar voor iedereen"
  ON spelers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Alleen admins kunnen spelers beheren" ON spelers;
CREATE POLICY "Alleen admins kunnen spelers beheren"
  ON spelers FOR ALL USING (is_admin());

-- ================================================
-- DONE. Verify with:
--   SELECT naam, actief, volgorde FROM spelers ORDER BY volgorde;
-- ================================================
