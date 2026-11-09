-- ================================================
-- ULTRAWEAR INDOOR - VERWIJDER VERWEESDE player_reviews TABEL
-- ================================================
-- De app gebruikt uitsluitend `reviews` (zie useProfiles / submit_review).
-- `player_reviews` is een oude, lege tabel (0 rijen, geen enkele referentie in
-- de code) en kan weg. Dit verwijdert meteen zijn drie RLS-policies mee.
--
-- Gecontroleerd op 2026-08-13: player_reviews = 0 rijen, reviews = 40 rijen.
-- Draai in de SQL editor. CASCADE vangt eventuele afhankelijke objecten op.
-- ================================================

DROP TABLE IF EXISTS player_reviews CASCADE;

-- ================================================
-- DONE. Controleer met de diagnose-query: player_reviews hoort niet meer in de
-- policy-lijst te staan.
-- ================================================
