-- ================================================
-- Wedstrijden: forfait-markering
-- ================================================
-- Run once in the Supabase SQL Editor.
--
-- Markeert een wedstrijd als forfait. Een forfait telt wél mee voor de stand
-- (winst/verlies + punten) maar de score (bv. 10-0) telt NIET mee in de
-- doelpunttotalen of spelersstatistieken.
-- ================================================

ALTER TABLE wedstrijden
  ADD COLUMN IF NOT EXISTS forfait BOOLEAN DEFAULT false;
