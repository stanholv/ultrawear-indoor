-- ================================================
-- ULTRAWEAR INDOOR - SEIZOEN (SEASON) MIGRATION
-- ================================================
-- Adds a season dimension so matches (and their stats, via the FK) can be
-- grouped and archived per season. Non-destructive: existing rows are
-- backfilled to '2025-2026' and nothing is deleted.
--
-- Run this once against the live database (SQL editor or `supabase db push`).
--
-- Season labels use the form 'YYYY-YYYY' (e.g. '2025-2026'). The application
-- (src/lib/seizoen.ts) derives a match's season from its date using an
-- August–July split, and tags new matches on insert. This migration only
-- needs to add the column, backfill history, and index it.
-- ================================================

-- 1. Add the column (nullable so the backfill can run in one pass).
ALTER TABLE wedstrijden
  ADD COLUMN IF NOT EXISTS seizoen TEXT;

-- 2. Backfill. Everything currently in the table is the 2025-2026 season.
--    (Older seasons, if imported later, should be tagged on import.)
UPDATE wedstrijden
  SET seizoen = '2025-2026'
  WHERE seizoen IS NULL;

-- 3. Index for per-season filtering.
CREATE INDEX IF NOT EXISTS idx_wedstrijden_seizoen ON wedstrijden(seizoen);

-- ------------------------------------------------
-- OPTIONAL: derive-from-date backfill instead of step 2.
-- If you ever have historical matches with correct dates but no season, this
-- computes the label from the date (Aug–Jul split) rather than assuming one
-- season. Safe to run repeatedly.
-- ------------------------------------------------
-- UPDATE wedstrijden
--   SET seizoen = CASE
--     WHEN EXTRACT(MONTH FROM datum) >= 8
--       THEN EXTRACT(YEAR FROM datum)::int       || '-' || (EXTRACT(YEAR FROM datum)::int + 1)
--     ELSE (EXTRACT(YEAR FROM datum)::int - 1)    || '-' || EXTRACT(YEAR FROM datum)::int
--   END
--   WHERE seizoen IS NULL;

-- ================================================
-- DONE. Verify with:
--   SELECT seizoen, COUNT(*) FROM wedstrijden GROUP BY seizoen ORDER BY seizoen;
-- ================================================
