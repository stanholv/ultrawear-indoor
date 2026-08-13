-- ================================================
-- ULTRAWEAR INDOOR - ADMIN-CHECK CONSOLIDATIE
-- ================================================
-- De live database controleerde "is de gebruiker admin?" op zes plaatsen met
-- een ingebouwde subquery, terwijl de nieuwe `spelers`-tabel is_admin() gebruikt.
-- Deze migratie zet alle admin-write-policies op één helper: is_admin().
--
-- Gedragsbehoudend: is_admin() is logisch identiek aan de bestaande
-- `EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')`.
-- SELECT-policies (publiek leesbaar) blijven ongewijzigd.
--
-- Niet aangeraakt (bewust, aparte beslissing):
--   * player_reviews  → lijkt een verweesde/oude reviewtabel; eerst bevestigen
--                       of hij weg mag i.p.v. zijn policy te herschrijven.
--   * protect_privileged_profile_columns() → trigger werkt correct; laat staan.
--
-- Idempotent: veilig om opnieuw te draaien. Draai in één keer (SQL editor).
-- ================================================

-- 0. Zorg dat de helper bestaat (SECURITY DEFINER → leest profiles zonder RLS-recursie).
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- 1. profiles — admins mogen elk profiel updaten.
DROP POLICY IF EXISTS "Admins kunnen alle profielen updaten" ON profiles;
CREATE POLICY "Admins kunnen alle profielen updaten"
  ON profiles FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- 2. wedstrijden — admin-only writes.
DROP POLICY IF EXISTS "Alleen admins kunnen wedstrijden beheren" ON wedstrijden;
CREATE POLICY "Alleen admins kunnen wedstrijden beheren"
  ON wedstrijden FOR ALL
  USING (is_admin());

-- 3. speler_stats — admin-only writes.
DROP POLICY IF EXISTS "Admins kunnen stats beheren" ON speler_stats;
CREATE POLICY "Admins kunnen stats beheren"
  ON speler_stats FOR ALL
  USING (is_admin());

-- 4. reviews — alleen admins verwijderen (verwijdert ook de dode
--    `auth.jwt() ->> 'role'`-clausule; die 'role' is de Postgres-rol, niet
--    profiles.role, dus altijd onwaar).
DROP POLICY IF EXISTS "Alleen admins mogen reviews verwijderen" ON reviews;
CREATE POLICY "Alleen admins mogen reviews verwijderen"
  ON reviews FOR DELETE
  USING (is_admin());

-- ================================================
-- DONE. Controleer met dezelfde diagnose-query; elke admin-policy hoort nu
-- `is_admin()` als qual te tonen.
-- ================================================
