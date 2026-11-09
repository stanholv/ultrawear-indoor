-- =====================================================================
-- ULTRAWEAR INDOOR: VOLLEDIG DATABASESCHEMA
-- =====================================================================
-- Momentopname van de LIVE Supabase-database (project "Ultrawear Indoor",
-- ref ziuwzvlttdzegmvsdiim), uitgelezen uit de Postgres-catalogus op
-- 2026-11-09. Dit bestand vervangt de losse supabase-*.sql patches; die staan
-- ter referentie nog in supabase/history/.
--
-- Gebruik: plak dit in de SQL Editor van een LEEG Supabase-project (of een
-- andere Postgres met Supabase Auth) om de volledige structuur op te bouwen.
-- Daarna de data terugzetten (zie supabase/README.md → "Back-up").
--
-- Wijzig je later iets aan de database? Pas dan ook dit bestand aan, zodat
-- het de waarheid blijft. Opnieuw genereren kan met:
--   npx supabase db dump --db-url "$SUPABASE_DB_URL" -s public -f supabase/schema.sql
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. TABELLEN (in volgorde van foreign keys)
-- ---------------------------------------------------------------------

-- Spelersselectie (bron van waarheid voor wie in de ploeg zit)
CREATE TABLE public.spelers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  naam text NOT NULL,
  actief boolean DEFAULT true NOT NULL,
  volgorde integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT spelers_pkey PRIMARY KEY (id),
  CONSTRAINT spelers_naam_key UNIQUE (naam)
);

-- Ongebruikt (0 rijen, geen policies): het seizoen staat als tekst in
-- wedstrijden.seizoen. Bewaard omdat wedstrijden.seizoen_id ernaar verwijst.
CREATE TABLE public.seizoenen (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  naam text NOT NULL,
  start_datum date NOT NULL,
  eind_datum date NOT NULL,
  actief boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT seizoenen_pkey PRIMARY KEY (id)
);

CREATE TABLE public.wedstrijden (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  datum date NOT NULL,
  tijd time without time zone NOT NULL,
  thuisploeg text DEFAULT 'Ultrawear Indoor'::text,
  uitploeg text NOT NULL,
  uitslag text,
  opmerkingen text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  seizoen_id uuid,                 -- legacy, ongebruikt
  type text DEFAULT 'competitie'::text,
  forfait boolean DEFAULT false,
  owngoals integer DEFAULT 0,
  seizoen text,                    -- bv. '2026-2027'
  thuisscore integer,
  uitscore integer,
  CONSTRAINT wedstrijden_pkey PRIMARY KEY (id),
  CONSTRAINT unique_wedstrijd UNIQUE (datum, tijd, thuisploeg, uitploeg),
  CONSTRAINT wedstrijden_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT wedstrijden_seizoen_id_fkey FOREIGN KEY (seizoen_id) REFERENCES public.seizoenen(id),
  CONSTRAINT wedstrijden_owngoals_check CHECK ((owngoals >= 0))
);

CREATE TABLE public.speler_stats (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  wedstrijd_id uuid,
  speler_naam text NOT NULL,
  aanwezig boolean DEFAULT false,
  doelpunten integer DEFAULT 0,
  penalty integer DEFAULT 0,
  corner integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT speler_stats_pkey PRIMARY KEY (id),
  CONSTRAINT speler_stats_wedstrijd_id_fkey FOREIGN KEY (wedstrijd_id) REFERENCES public.wedstrijden(id) ON DELETE CASCADE,
  CONSTRAINT speler_stats_corner_check CHECK ((corner >= 0)),
  CONSTRAINT speler_stats_doelpunten_check CHECK ((doelpunten >= 0)),
  CONSTRAINT speler_stats_penalty_check CHECK ((penalty >= 0))
);

-- Eén rij per login-account (aangemaakt door trigger on_auth_user_created)
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  email text,
  full_name text,
  role text DEFAULT 'speler'::text,
  created_at timestamp with time zone DEFAULT now(),
  bio text,
  profile_photo_url text,          -- legacy, ongebruikt
  facebook_url text,               -- legacy, ongebruikt
  shirt_number integer,            -- legacy, vervangen door rugnummer
  speler_naam text,                -- koppeling account ↔ speler (alleen admin)
  rugnummer integer,
  positie text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT profiles_role_check CHECK ((role = ANY (ARRAY['speler'::text, 'admin'::text, 'coach'::text])))
);

CREATE TABLE public.reviews (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  speler_naam text NOT NULL,
  score integer,
  commentaar text,
  ip_adres text,
  created_at timestamp with time zone DEFAULT now(),
  reviewer_naam text,
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_score_check CHECK (((score >= 1) AND (score <= 5)))
);

-- ---- Financiën (alleen admins) ----

CREATE TABLE public.leden (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  naam text NOT NULL,
  speler_id uuid,
  adres text,
  geboortedatum date,
  telefoon text,
  actief boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leden_pkey PRIMARY KEY (id),
  CONSTRAINT leden_naam_key UNIQUE (naam),
  CONSTRAINT leden_speler_id_fkey FOREIGN KEY (speler_id) REFERENCES public.spelers(id) ON DELETE SET NULL
);

CREATE TABLE public.fin_categorieen (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  naam text NOT NULL,
  richting text NOT NULL,
  is_lidgeld boolean DEFAULT false NOT NULL,
  volgorde integer DEFAULT 0 NOT NULL,
  actief boolean DEFAULT true NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fin_categorieen_pkey PRIMARY KEY (id),
  CONSTRAINT fin_categorieen_naam_richting_key UNIQUE (naam, richting),
  CONSTRAINT fin_categorieen_richting_check CHECK ((richting = ANY (ARRAY['in'::text, 'uit'::text])))
);

CREATE TABLE public.fin_seizoenen (
  seizoen text NOT NULL,
  startsaldo numeric(10,2) DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fin_seizoenen_pkey PRIMARY KEY (seizoen)
);

CREATE TABLE public.inschrijvingen (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  lid_id uuid NOT NULL,
  seizoen text NOT NULL,
  bevestigd boolean DEFAULT false NOT NULL,
  verwacht_lidgeld numeric(10,2),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT inschrijvingen_pkey PRIMARY KEY (id),
  CONSTRAINT inschrijvingen_lid_id_seizoen_key UNIQUE (lid_id, seizoen),
  CONSTRAINT inschrijvingen_lid_id_fkey FOREIGN KEY (lid_id) REFERENCES public.leden(id) ON DELETE CASCADE
);

CREATE TABLE public.fin_transacties (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  seizoen text NOT NULL,
  datum date DEFAULT CURRENT_DATE NOT NULL,
  categorie_id uuid NOT NULL,
  bedrag numeric(10,2) NOT NULL,
  lid_id uuid,
  omschrijving text,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT fin_transacties_pkey PRIMARY KEY (id),
  CONSTRAINT fin_transacties_categorie_id_fkey FOREIGN KEY (categorie_id) REFERENCES public.fin_categorieen(id) ON DELETE RESTRICT,
  CONSTRAINT fin_transacties_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT fin_transacties_lid_id_fkey FOREIGN KEY (lid_id) REFERENCES public.leden(id) ON DELETE SET NULL,
  CONSTRAINT fin_transacties_bedrag_check CHECK ((bedrag > (0)::numeric))
);

-- ---- Externe logins (alleen admins) ----
-- Gedeelde logins voor externe portalen (wedstrijdformulieren). NOOIT
-- wachtwoorden in de code of in dit bestand zetten: de repo is publiek.
-- Invullen via Admin → Wedstrijdformulieren. Zie supabase/externe-logins.sql.
CREATE TABLE public.externe_logins (
  id text NOT NULL,
  url text,
  gebruikersnaam text,
  wachtwoord text,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT externe_logins_pkey PRIMARY KEY (id)
);


-- ---------------------------------------------------------------------
-- 2. INDEXEN
-- ---------------------------------------------------------------------
CREATE INDEX idx_spelers_actief ON public.spelers USING btree (actief);
CREATE INDEX idx_wedstrijden_datum ON public.wedstrijden USING btree (datum DESC);
CREATE INDEX idx_wedstrijden_created_by ON public.wedstrijden USING btree (created_by);
CREATE INDEX idx_wedstrijden_seizoen ON public.wedstrijden USING btree (seizoen_id);
CREATE INDEX idx_speler_stats_naam ON public.speler_stats USING btree (speler_naam);
CREATE INDEX idx_speler_stats_wedstrijd ON public.speler_stats USING btree (wedstrijd_id);
CREATE INDEX idx_leden_speler ON public.leden USING btree (speler_id);
CREATE UNIQUE INDEX uniq_fin_lidgeld_categorie ON public.fin_categorieen USING btree (is_lidgeld) WHERE is_lidgeld;
CREATE INDEX idx_inschrijvingen_seizoen ON public.inschrijvingen USING btree (seizoen);
CREATE INDEX idx_fin_transacties_categorie ON public.fin_transacties USING btree (categorie_id);
CREATE INDEX idx_fin_transacties_lid ON public.fin_transacties USING btree (lid_id);
CREATE INDEX idx_fin_transacties_seizoen ON public.fin_transacties USING btree (seizoen);


-- ---------------------------------------------------------------------
-- 2b. VIEWS
-- ---------------------------------------------------------------------
-- Ongebruikt door de app (die rekent zelf in useStats), maar bestaat live.
CREATE VIEW public.speler_totalen WITH (security_invoker = true) AS
 SELECT speler_naam,
    count(CASE WHEN (aanwezig = true) THEN 1 ELSE NULL::integer END) AS totaal_aanwezig,
    sum(doelpunten) AS totaal_doelpunten,
    sum(penalty) AS totaal_penalties,
    sum(corner) AS totaal_corners
   FROM speler_stats
  GROUP BY speler_naam
  ORDER BY (sum(doelpunten)) DESC, (count(CASE WHEN (aanwezig = true) THEN 1 ELSE NULL::integer END)) DESC;


-- ---------------------------------------------------------------------
-- 3. FUNCTIES
-- ---------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$function$;

-- Maakt automatisch een profiel aan bij elke nieuwe login.
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'speler'  -- Default role
  );
  RETURN NEW;
END;
$function$;

-- Niet-admins mogen hun eigen rol / spelerkoppeling niet wijzigen.
CREATE OR REPLACE FUNCTION public.protect_privileged_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  caller_is_admin BOOLEAN;
BEGIN
  -- SECURITY DEFINER => this SELECT bypasses RLS, so there is no policy
  -- recursion and a non-admin cannot hide their real role.
  SELECT (role = 'admin') INTO caller_is_admin
  FROM profiles
  WHERE id = auth.uid();

  -- auth.uid() IS NULL means a trusted server-side / service-role context
  -- (SQL Editor, edge functions). Only gate real authenticated users.
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
$function$;

-- Review indienen met rate limit (1 per IP per speler per uur).
CREATE OR REPLACE FUNCTION public.submit_review(p_speler_naam text, p_score integer, p_commentaar text, p_reviewer_naam text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_headers JSON := current_setting('request.headers', true)::json;
  v_ip      TEXT;
  v_count   INT;
BEGIN
  -- Validate input
  IF p_speler_naam IS NULL OR length(trim(p_speler_naam)) = 0 THEN
    RAISE EXCEPTION 'Geen speler opgegeven';
  END IF;
  IF p_score IS NULL OR p_score < 1 OR p_score > 5 THEN
    RAISE EXCEPTION 'Score moet tussen 1 en 5 liggen';
  END IF;

  -- Derive the real client IP server-side. cf-connecting-ip is set by the
  -- Cloudflare edge and cannot be forged by the client; fall back to the
  -- first hop of x-forwarded-for.
  v_ip := COALESCE(
    v_headers ->> 'cf-connecting-ip',
    split_part(v_headers ->> 'x-forwarded-for', ',', 1)
  );

  -- Rate limit: max 1 review per IP per player per hour
  SELECT count(*) INTO v_count
  FROM reviews
  WHERE speler_naam = p_speler_naam
    AND ip_adres = v_ip
    AND created_at >= now() - interval '1 hour';

  IF v_count > 0 THEN
    RAISE EXCEPTION 'Je hebt al een review achtergelaten voor deze speler.';
  END IF;

  INSERT INTO reviews (speler_naam, score, commentaar, reviewer_naam, ip_adres)
  VALUES (
    trim(p_speler_naam),
    p_score,
    left(trim(coalesce(p_commentaar, '')), 1000),
    left(trim(coalesce(p_reviewer_naam, '')), 100),
    v_ip
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_modified_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public', 'pg_temp'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

-- Admin-only accountlijst mét e-mail (email is niet direct leesbaar, zie
-- de kolomrechten in sectie 5).
CREATE OR REPLACE FUNCTION public.admin_list_profiles()
 RETURNS TABLE(id uuid, full_name text, email text, role text, speler_naam text, created_at timestamp with time zone)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

REVOKE ALL ON FUNCTION public.admin_list_profiles() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_list_profiles() TO authenticated;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;


-- ---------------------------------------------------------------------
-- 4. TRIGGERS
-- ---------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER protect_profile_columns BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_privileged_profile_columns();

-- NB: twee triggers die hetzelfde doen; zie cleanup-voorstel in supabase/README.md.
CREATE TRIGGER update_wedstrijden_modtime BEFORE UPDATE ON public.wedstrijden
  FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();
CREATE TRIGGER update_wedstrijden_updated_at BEFORE UPDATE ON public.wedstrijden
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_externe_logins_updated_at BEFORE UPDATE ON public.externe_logins
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ---------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------
ALTER TABLE public.spelers         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seizoenen       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedstrijden     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speler_stats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leden           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_categorieen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_seizoenen   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inschrijvingen  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fin_transacties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.externe_logins  ENABLE ROW LEVEL SECURITY;

-- Publiek leesbaar, alleen admins schrijven
CREATE POLICY "Spelers zijn zichtbaar voor iedereen" ON public.spelers FOR SELECT TO public USING (true);
CREATE POLICY "Alleen admins kunnen spelers beheren" ON public.spelers FOR ALL TO public USING (is_admin());

CREATE POLICY "Wedstrijden zijn zichtbaar voor iedereen" ON public.wedstrijden FOR SELECT TO public USING (true);
CREATE POLICY "Alleen admins kunnen wedstrijden beheren" ON public.wedstrijden FOR ALL TO public USING (is_admin());

CREATE POLICY "Stats zijn zichtbaar voor iedereen" ON public.speler_stats FOR SELECT TO public USING (true);
CREATE POLICY "Admins kunnen stats beheren" ON public.speler_stats FOR ALL TO public USING (is_admin());

-- Profielen
-- De rijen zijn publiek (spelerspagina), de kolom `email` niet: zie de
-- kolomrechten hieronder. Admins lezen e-mail via admin_list_profiles().
CREATE POLICY "Profiles leesbaar voor iedereen" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO public USING ((auth.uid() = id));
CREATE POLICY "Admins kunnen alle profielen updaten" ON public.profiles FOR UPDATE TO public
  USING (is_admin()) WITH CHECK (is_admin());

-- Reviews
-- De rijen zijn publiek, de kolom `ip_adres` niet (kolomrechten hieronder;
-- submit_review() is SECURITY DEFINER en leest hem wel voor de rate limit).
-- NB: de INSERT-policy laat directe inserts toe en omzeilt zo de rate limit
-- van submit_review(); zie supabase/README.md.
CREATE POLICY "Reviews leesbaar voor iedereen" ON public.reviews FOR SELECT TO public USING (true);
CREATE POLICY "Iedereen mag review toevoegen" ON public.reviews FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Alleen admins mogen reviews verwijderen" ON public.reviews FOR DELETE TO public USING (is_admin());

-- Financiën: alleen admins
CREATE POLICY "Leden alleen voor admins" ON public.leden FOR ALL TO public USING (is_admin());
CREATE POLICY "Categorieen alleen voor admins" ON public.fin_categorieen FOR ALL TO public USING (is_admin());
CREATE POLICY "Fin-seizoenen alleen voor admins" ON public.fin_seizoenen FOR ALL TO public USING (is_admin());
CREATE POLICY "Inschrijvingen alleen voor admins" ON public.inschrijvingen FOR ALL TO public USING (is_admin());
CREATE POLICY "Transacties alleen voor admins" ON public.fin_transacties FOR ALL TO public USING (is_admin());

-- Kolomrechten: email en ip_adres zijn niet leesbaar voor anon/authenticated
-- (supabase/privacy-kolommen.sql). Nieuwe kolommen moeten hier expliciet bij
-- als ze publiek leesbaar moeten zijn; gebruik in de app nooit select('*')
-- op deze twee tabellen.
REVOKE SELECT ON public.profiles FROM anon, authenticated;
GRANT SELECT (
  id, full_name, role, speler_naam, rugnummer, positie, bio,
  profile_photo_url, facebook_url, shirt_number, created_at
) ON public.profiles TO anon, authenticated;

REVOKE SELECT ON public.reviews FROM anon, authenticated;
GRANT SELECT (
  id, speler_naam, score, commentaar, reviewer_naam, created_at
) ON public.reviews TO anon, authenticated;

-- Externe logins: alleen admins; anon heeft geen enkel recht op de tabel.
REVOKE ALL ON public.externe_logins FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.externe_logins TO authenticated;
CREATE POLICY "Externe logins alleen voor admins" ON public.externe_logins
  FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- seizoenen: RLS aan, geen policies → via de API niet bereikbaar (ongebruikt).
