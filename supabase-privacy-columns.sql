-- ================================================
-- ULTRAWEAR INDOOR - PRIVACY: e-mail en IP-adres afschermen
-- ================================================
-- Probleem: `profiles` en `reviews` hebben een publieke SELECT-policy
-- (USING true). Met de publieke anon key kon iedereen daardoor
--   * profiles.email   (e-mailadres van elk account) en
--   * reviews.ip_adres (IP van elke reviewer, opgeslagen door submit_review())
-- uitlezen.
--
-- Oplossing: kolomrechten. RLS bepaalt welke RIJEN zichtbaar zijn; GRANTs
-- bepalen welke KOLOMMEN. We trekken het tabelbrede SELECT-recht in en geven
-- het terug op alle kolommen behalve email / ip_adres. De publieke pagina's
-- (Spelers, spelersprofiel, reviews) blijven werken; `select email` of
-- `select *` geeft voor anon/authenticated voortaan "permission denied".
--
--   * submit_review() is SECURITY DEFINER → de rate-limit-check op ip_adres
--     blijft werken.
--   * is_admin(), handle_new_user() en protect_privileged_profile_columns()
--     zijn SECURITY DEFINER → niet geraakt.
--   * Admins halen e-mailadressen op via admin_list_profiles() (hieronder),
--     die zelf is_admin() controleert.
--   * UPDATE/DELETE ... WHERE id/speler_naam = ... blijven werken: die
--     kolommen zijn leesbaar.
--
-- LET OP: nieuwe kolommen op profiles/reviews zijn na deze migratie NIET
-- automatisch leesbaar voor anon/authenticated. Voeg ze toe aan de GRANT
-- hieronder (en in supabase-schema.sql) als ze publiek moeten zijn.
--
-- Uitvoeren: één keer in de Supabase SQL Editor (project ziuwzvlttdzegmvsdiim),
-- NA het deployen van de bijbehorende frontend (die geen `select('*')` meer
-- doet op deze tabellen). Idempotent.
-- ================================================

BEGIN;

-- 1. profiles: alles leesbaar behalve email ------------------------------
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, full_name, role, speler_naam, rugnummer, positie, bio,
  profile_photo_url, facebook_url, shirt_number, created_at
) ON public.profiles TO anon, authenticated;

-- 2. reviews: alles leesbaar behalve ip_adres ----------------------------
REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (
  id, speler_naam, score, commentaar, reviewer_naam, created_at
) ON public.reviews TO anon, authenticated;

-- 3. Admin-only lijst van accounts mét e-mailadres -----------------------
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
RETURNS TABLE (
  id          UUID,
  full_name   TEXT,
  email       TEXT,
  role        TEXT,
  speler_naam TEXT,
  created_at  TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Alleen admins mogen accounts opvragen'
      USING ERRCODE = '42501';
  END IF;

  RETURN QUERY
    SELECT p.id, p.full_name, p.email, p.role, p.speler_naam, p.created_at
    FROM public.profiles p
    ORDER BY p.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;

COMMIT;

-- ================================================
-- Controle (als anon, bv. via de REST API met de anon key):
--   GET /rest/v1/profiles?select=email        → 401/403 permission denied
--   GET /rest/v1/reviews?select=ip_adres      → 401/403 permission denied
--   GET /rest/v1/profiles?select=id,speler_naam,rugnummer → werkt
--   POST /rest/v1/rpc/admin_list_profiles      → permission denied (anon)
--
-- Terugdraaien (alleen bij nood — zet het lek weer open):
--   GRANT SELECT ON public.profiles, public.reviews TO anon, authenticated;
-- ================================================
