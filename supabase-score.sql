-- ================================================
-- ULTRAWEAR INDOOR - INTEGER SCORE MIGRATION
-- ================================================
-- Stores the match score as two integers (thuisscore / uitscore) instead of
-- only the text `uitslag` ('5-3'). The app keeps `uitslag` in sync for display
-- and backward compatibility, but logic (points, win/loss, totals) reads the
-- integers. Non-destructive: existing text results are parsed into the new
-- columns; anything unparseable is left NULL and still falls back to `uitslag`.
--
-- Run once (SQL editor or `supabase db push`).
-- ================================================

ALTER TABLE wedstrijden ADD COLUMN IF NOT EXISTS thuisscore INTEGER;
ALTER TABLE wedstrijden ADD COLUMN IF NOT EXISTS uitscore INTEGER;

-- Backfill from the existing 'x-y' text, tolerating surrounding whitespace.
UPDATE wedstrijden
SET
  thuisscore = NULLIF(trim(split_part(uitslag, '-', 1)), '')::int,
  uitscore   = NULLIF(trim(split_part(uitslag, '-', 2)), '')::int
WHERE thuisscore IS NULL
  AND uitslag IS NOT NULL
  AND uitslag <> '-'
  AND uitslag ~ '^\s*\d+\s*-\s*\d+\s*$';

-- ================================================
-- DONE. Verify with:
--   SELECT uitslag, thuisscore, uitscore FROM wedstrijden
--   WHERE uitslag IS NOT NULL ORDER BY datum DESC LIMIT 10;
-- ================================================
