-- =====================================================================
-- OPSCHONING: VOORSTEL (nog NIET uitgevoerd op de live database)
-- =====================================================================
-- Kleine, veilige verbeteringen uit de Supabase Security Advisor en de
-- schema-review van november 2026. Niets hieronder verandert iets aan wat
-- spelers of admins in de app zien. Uitvoeren in de SQL Editor; alles staat
-- in één transactie, dus bij een fout wordt niets gewijzigd.
-- Pas daarna ook supabase/schema.sql aan (of genereer opnieuw).
-- =====================================================================
BEGIN;

-- 1. Dubbele updated_at-trigger op wedstrijden: beide doen exact hetzelfde.
DROP TRIGGER IF EXISTS update_wedstrijden_modtime ON public.wedstrijden;
DROP FUNCTION IF EXISTS public.update_modified_column();

-- 2. Advisor "Function Search Path Mutable".
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- 3. Advisor "SECURITY DEFINER function executable": trigger-functies hoeven
--    niet via /rest/v1/rpc aanroepbaar te zijn. Triggers blijven gewoon werken
--    (EXECUTE wordt niet gecontroleerd wanneer een trigger afgaat).
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_privileged_profile_columns() FROM PUBLIC, anon, authenticated;

-- 4. Reviews alleen via submit_review(): de open INSERT-policy liet iedereen
--    met de (publieke) anon key rechtstreeks inserten en zo de rate limit en
--    de server-side IP-bepaling omzeilen. De app gebruikt al uitsluitend de RPC.
DROP POLICY IF EXISTS "Iedereen mag review toevoegen" ON public.reviews;

COMMIT;
