-- ================================================
-- Wedstrijden: owngoals (in het voordeel van Ultrawear)
-- ================================================
-- Run once in the Supabase SQL Editor.
--
-- Aantal owngoals door de tegenstander in deze wedstrijd (tellen voor Ultrawear
-- maar horen bij geen enkele speler). Hiermee verzoenen de totalen:
--   spelersgoals + owngoals = teamscore.
-- ================================================

ALTER TABLE wedstrijden
  ADD COLUMN IF NOT EXISTS owngoals INTEGER DEFAULT 0 CHECK (owngoals >= 0);
