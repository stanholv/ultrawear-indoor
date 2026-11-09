-- ================================================
-- ULTRAWEAR INDOOR - SUPABASE DATABASE SCHEMA
-- ================================================
-- Reconstructed from application code (the live database is the source of
-- truth; verify with `supabase db dump` if exact constraints matter).
--
-- Run order for a fresh project:
--   1. This file
--   2. supabase-rls-fix.sql          (profiles privileged-column trigger)
--   3. supabase-reviews-ratelimit.sql (review submission RPC + rate limit)
-- ================================================

-- ================================================
-- 1. PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'speler' CHECK (role IN ('speler', 'admin', 'coach')),
  speler_naam TEXT,                       -- account ↔ player coupling (admin-managed)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 2. WEDSTRIJDEN TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS wedstrijden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  datum DATE NOT NULL,
  tijd TIME NOT NULL,
  thuisploeg TEXT DEFAULT 'Ultrawear Indoor',
  uitploeg TEXT NOT NULL,
  uitslag TEXT,
  type TEXT DEFAULT 'competitie' CHECK (type IN ('competitie', 'beker', 'oefenwedstrijd')),
  opmerkingen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- ================================================
-- 3. SPELER STATS TABLE
-- ================================================
-- NOTE: the application reads/writes this table as `speler_stats`. The
-- `useWedstrijden` hook still references a `speler_prestaties` table in its
-- create/delete paths — that is a latent bug, not a second table.
CREATE TABLE IF NOT EXISTS speler_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedstrijd_id UUID REFERENCES wedstrijden ON DELETE CASCADE,
  speler_naam TEXT NOT NULL,
  aanwezig BOOLEAN DEFAULT false,
  doelpunten INTEGER DEFAULT 0 CHECK (doelpunten >= 0),
  penalty INTEGER DEFAULT 0 CHECK (penalty >= 0),
  corner INTEGER DEFAULT 0 CHECK (corner >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 4. REVIEWS TABLE
-- ================================================
-- Anonymous player reviews. Writes go through the submit_review() function
-- (see supabase-reviews-ratelimit.sql); reads are public.
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  speler_naam TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  commentaar TEXT,
  reviewer_naam TEXT,
  ip_adres TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- 5. INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_wedstrijden_datum ON wedstrijden(datum DESC);
CREATE INDEX IF NOT EXISTS idx_wedstrijden_created_by ON wedstrijden(created_by);
CREATE INDEX IF NOT EXISTS idx_speler_stats_wedstrijd ON speler_stats(wedstrijd_id);
CREATE INDEX IF NOT EXISTS idx_speler_stats_naam ON speler_stats(speler_naam);
CREATE INDEX IF NOT EXISTS idx_reviews_speler ON reviews(speler_naam);
CREATE INDEX IF NOT EXISTS idx_reviews_ip_created ON reviews(ip_adres, created_at);

-- ================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedstrijden ENABLE ROW LEVEL SECURITY;
ALTER TABLE speler_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Helper: is the current user an admin? SECURITY DEFINER avoids RLS recursion
-- when policies on `profiles` need to check the caller's role.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Profiles: a user can read their own profile; admins can read all.
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id OR is_admin());

-- Profiles: a user can update their own row; admins can update any.
-- Privileged columns (role, speler_naam) are guarded by the trigger in
-- supabase-rls-fix.sql so a non-admin cannot escalate via their own row.
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id OR is_admin());

-- Profiles: admins can delete profiles.
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
CREATE POLICY "Admins can delete profiles"
  ON profiles FOR DELETE
  USING (is_admin());

-- Profiles: a user can insert their own row on sign-up.
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Wedstrijden: public read, admin-only writes.
DROP POLICY IF EXISTS "Wedstrijden zijn zichtbaar voor iedereen" ON wedstrijden;
CREATE POLICY "Wedstrijden zijn zichtbaar voor iedereen"
  ON wedstrijden FOR SELECT USING (true);

DROP POLICY IF EXISTS "Alleen admins kunnen wedstrijden beheren" ON wedstrijden;
CREATE POLICY "Alleen admins kunnen wedstrijden beheren"
  ON wedstrijden FOR ALL USING (is_admin());

-- Speler stats: public read, admin-only writes.
DROP POLICY IF EXISTS "Stats zijn zichtbaar voor iedereen" ON speler_stats;
CREATE POLICY "Stats zijn zichtbaar voor iedereen"
  ON speler_stats FOR SELECT USING (true);

DROP POLICY IF EXISTS "Alleen admins kunnen stats beheren" ON speler_stats;
CREATE POLICY "Alleen admins kunnen stats beheren"
  ON speler_stats FOR ALL USING (is_admin());

-- Reviews: public read. Inserts only via submit_review() (no INSERT policy);
-- admins can delete for moderation.
DROP POLICY IF EXISTS "Reviews zijn zichtbaar voor iedereen" ON reviews;
CREATE POLICY "Reviews zijn zichtbaar voor iedereen"
  ON reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins kunnen reviews verwijderen" ON reviews;
CREATE POLICY "Admins kunnen reviews verwijderen"
  ON reviews FOR DELETE USING (is_admin());

-- ================================================
-- 7. TRIGGER TO AUTO-UPDATE updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wedstrijden_updated_at ON wedstrijden;
CREATE TRIGGER update_wedstrijden_updated_at
  BEFORE UPDATE ON wedstrijden
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- 8. VIEW FOR AGGREGATED STATS
-- ================================================
CREATE OR REPLACE VIEW speler_totalen AS
SELECT
  speler_naam,
  COUNT(CASE WHEN aanwezig = true THEN 1 END) as totaal_aanwezig,
  SUM(doelpunten) as totaal_doelpunten,
  SUM(penalty) as totaal_penalties,
  SUM(corner) as totaal_corners
FROM speler_stats
GROUP BY speler_naam
ORDER BY totaal_doelpunten DESC, totaal_aanwezig DESC;

GRANT SELECT ON speler_totalen TO authenticated;
GRANT SELECT ON speler_totalen TO anon;

-- ================================================
-- SETUP COMPLETE — now run the two migration files (see header).
-- ================================================
