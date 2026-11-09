-- ================================================
-- Profiles: protect privileged columns
-- ================================================
-- Run once in the Supabase SQL Editor.
--
-- Ensures only admins can change `role` or `speler_naam` on a profile.
-- Authenticated users may still edit their own non-privileged fields
-- (e.g. full_name). Service-role / SQL Editor context (auth.uid() IS NULL)
-- is unaffected, so the first admin can still be set up manually.
-- ================================================

CREATE OR REPLACE FUNCTION protect_privileged_profile_columns()
RETURNS TRIGGER AS $$
DECLARE
  caller_is_admin BOOLEAN;
BEGIN
  -- SECURITY DEFINER => this SELECT bypasses RLS (no policy recursion).
  SELECT (role = 'admin') INTO caller_is_admin
  FROM profiles
  WHERE id = auth.uid();

  IF auth.uid() IS NOT NULL AND COALESCE(caller_is_admin, false) = false THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Niet toegestaan: rol kan niet gewijzigd worden';
    END IF;
    IF NEW.speler_naam IS DISTINCT FROM OLD.speler_naam THEN
      RAISE EXCEPTION 'Niet toegestaan: speler-koppeling kan niet gewijzigd worden';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS protect_profile_columns ON profiles;
CREATE TRIGGER protect_profile_columns
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION protect_privileged_profile_columns();
