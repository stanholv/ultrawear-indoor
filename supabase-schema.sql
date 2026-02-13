-- ================================================
-- ULTRAWEAR INDOOR - SUPABASE DATABASE SCHEMA
-- ================================================
-- Run this in the Supabase SQL Editor

-- ================================================
-- 1. PROFILES TABLE
-- ================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'speler' CHECK (role IN ('speler', 'admin', 'coach')),
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
  opmerkingen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users
);

-- ================================================
-- 3. SPELER STATS TABLE
-- ================================================
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
-- 4. INDEXES FOR PERFORMANCE
-- ================================================
CREATE INDEX IF NOT EXISTS idx_wedstrijden_datum ON wedstrijden(datum DESC);
CREATE INDEX IF NOT EXISTS idx_wedstrijden_created_by ON wedstrijden(created_by);
CREATE INDEX IF NOT EXISTS idx_speler_stats_wedstrijd ON speler_stats(wedstrijd_id);
CREATE INDEX IF NOT EXISTS idx_speler_stats_naam ON speler_stats(speler_naam);

-- ================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wedstrijden ENABLE ROW LEVEL SECURITY;
ALTER TABLE speler_stats ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Profiles: Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Wedstrijden: Everyone can read
DROP POLICY IF EXISTS "Wedstrijden zijn zichtbaar voor iedereen" ON wedstrijden;
CREATE POLICY "Wedstrijden zijn zichtbaar voor iedereen"
  ON wedstrijden FOR SELECT
  USING (true);

-- Wedstrijden: Only admins can insert/update/delete
DROP POLICY IF EXISTS "Alleen admins kunnen wedstrijden beheren" ON wedstrijden;
CREATE POLICY "Alleen admins kunnen wedstrijden beheren"
  ON wedstrijden FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Speler Stats: Everyone can read
DROP POLICY IF EXISTS "Stats zijn zichtbaar voor iedereen" ON speler_stats;
CREATE POLICY "Stats zijn zichtbaar voor iedereen"
  ON speler_stats FOR SELECT
  USING (true);

-- Speler Stats: Only admins can insert/update/delete
DROP POLICY IF EXISTS "Alleen admins kunnen stats beheren" ON speler_stats;
CREATE POLICY "Alleen admins kunnen stats beheren"
  ON speler_stats FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ================================================
-- 6. TRIGGER TO AUTO-UPDATE updated_at
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
-- 7. FUNCTION TO AUTO-CREATE PROFILE ON SIGNUP
-- ================================================
-- This will be handled in the auth.signUp function in the frontend
-- But you can also create a database trigger if preferred

-- ================================================
-- 8. SAMPLE DATA (OPTIONAL - for testing)
-- ================================================
-- Uncomment to insert sample data

-- INSERT INTO wedstrijden (datum, tijd, thuisploeg, uitploeg, uitslag, opmerkingen) VALUES
--   ('2026-01-15', '20:00', 'Ultrawear Indoor', 'Team Rockets', '5-3', 'Geweldige wedstrijd!'),
--   ('2026-01-22', '20:00', 'Ultrawear Indoor', 'De Leeuwen', '4-4', 'Spannend gelijkspel'),
--   ('2026-01-29', '20:00', 'Ultrawear Indoor', 'FC Winners', '6-2', 'Dominant gespeeld');

-- ================================================
-- 9. VIEW FOR AGGREGATED STATS (OPTIONAL)
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

-- Grant access to the view
GRANT SELECT ON speler_totalen TO authenticated;
GRANT SELECT ON speler_totalen TO anon;

-- ================================================
-- SETUP COMPLETE!
-- ================================================
-- Next steps:
-- 1. Create your first admin user in the Supabase Auth UI
-- 2. Manually update the profiles table to set role='admin' for that user
-- 3. Configure your frontend .env.local with Supabase credentials
-- ================================================
