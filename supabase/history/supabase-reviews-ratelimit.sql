-- ================================================
-- Reviews: server-side submission + rate limiting
-- ================================================
-- Run once in the Supabase SQL Editor.
--
-- Reviews are anonymous, so spam control is enforced in the database
-- instead of the browser:
--   * The client IP is read from the trusted proxy header server-side,
--     not from the request body, so it cannot be spoofed by the client.
--   * The "1 review per IP per player per hour" limit is enforced here,
--     so skipping the check client-side does nothing.
--   * Direct INSERT into reviews is revoked; rows can only be added
--     through this function. Public SELECT is unchanged.
-- ================================================

CREATE OR REPLACE FUNCTION submit_review(
  p_speler_naam   TEXT,
  p_score         INT,
  p_commentaar    TEXT,
  p_reviewer_naam TEXT
)
RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Only the function may insert; reads stay public.
REVOKE INSERT ON reviews FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION submit_review(TEXT, INT, TEXT, TEXT) TO anon, authenticated;

-- If an INSERT RLS policy exists that allowed public inserts, drop it so the
-- function (SECURITY DEFINER) is the only write path. Adjust the name if yours
-- differs; harmless if it doesn't exist.
DROP POLICY IF EXISTS "Iedereen kan reviews toevoegen" ON reviews;
