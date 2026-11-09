-- ================================================
-- ULTRAWEAR INDOOR - EXTERNE LOGINS (alleen admins)
-- ================================================
-- Waarom: de login voor het wedstrijdformulierenportaal stond als tekst in
-- src/components/Admin/AdminPage.tsx. De repo is publiek en die code zit in
-- de JavaScript die elke bezoeker downloadt, dus het wachtwoord was voor
-- iedereen leesbaar. Het staat nu in deze tabel, die alleen admins kunnen
-- lezen en wijzigen (RLS met is_admin(); anon heeft helemaal geen rechten).
--
-- Het wachtwoord staat hier BEWUST NIET in: dit bestand is publiek. Na het
-- uitvoeren vul je het (nieuwe) wachtwoord in via
-- Admin → Wedstrijdformulieren → Wijzigen.
--
-- Uitvoeren: één keer in de Supabase SQL Editor, VÓÓR het deployen van de
-- bijbehorende frontend. Onschadelijk voor de huidige site. Idempotent.
-- ================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.externe_logins (
  id             text PRIMARY KEY,           -- bv. 'wedstrijdformulieren'
  url            text,
  gebruikersnaam text,
  wachtwoord     text,
  updated_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.externe_logins ENABLE ROW LEVEL SECURITY;

-- Alleen ingelogde gebruikers kunnen de tabel überhaupt aanspreken, en RLS
-- laat daarvan alleen admins door.
REVOKE ALL ON public.externe_logins FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.externe_logins TO authenticated;

DROP POLICY IF EXISTS "Externe logins alleen voor admins" ON public.externe_logins;
CREATE POLICY "Externe logins alleen voor admins" ON public.externe_logins
  FOR ALL TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_externe_logins_updated_at ON public.externe_logins;
CREATE TRIGGER update_externe_logins_updated_at BEFORE UPDATE ON public.externe_logins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Startrij zonder wachtwoord.
INSERT INTO public.externe_logins (id, url, gebruikersnaam)
VALUES ('wedstrijdformulieren', 'https://www.mvvkuurne.be/profile', 'ultrawear.indoor')
ON CONFLICT (id) DO NOTHING;

COMMIT;

-- Controle (moet "permission denied" geven):
--   begin; set local role anon; select * from public.externe_logins; rollback;
