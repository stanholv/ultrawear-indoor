-- ================================================
-- ULTRAWEAR INDOOR — COMPETITIEKALENDER 2026-2027
-- ================================================
-- Import van de competitiewedstrijden (Tweede klasse, Harelbeekse Minivoetbal)
-- uit competitie-ultrawear-indoor.ics. Speeldagen 1-7, 9, 10, 11 (Speeldag 8
-- ontbrak in het bestand). Nog geen uitslag → tellen niet mee tot ze gespeeld
-- zijn.
--
-- thuisploeg/uitploeg volgt de kalender: staat Ultrawear links, dan spelen we
-- thuis; staat de tegenstander links, dan spelen we uit.
--
-- Idempotent: voegt alleen wedstrijden toe die er nog niet zijn (zelfde datum +
-- tijd + ploegen). Veilig om opnieuw te draaien. Draai in de SQL-editor.
-- ================================================

INSERT INTO wedstrijden (datum, tijd, thuisploeg, uitploeg, type, seizoen)
SELECT v.datum, v.tijd, v.thuisploeg, v.uitploeg, 'competitie', '2026-2027'
FROM (VALUES
  ('2026-08-31'::date, '20:00'::time, 'Icebears',         'Ultrawear Indoor'),
  ('2026-09-14'::date, '19:00'::time, 'Spectrum',         'Ultrawear Indoor'),
  ('2026-09-21'::date, '20:00'::time, 'De Dekkers',       'Ultrawear Indoor'),
  ('2026-10-01'::date, '19:00'::time, 'Incognito',        'Ultrawear Indoor'),
  ('2026-10-15'::date, '20:00'::time, 'Ultrawear Indoor', 'MVC Young Boys 21'),
  ('2026-10-22'::date, '19:00'::time, 'Ultrawear Indoor', 'La Belle Fleur'),
  ('2026-11-12'::date, '20:00'::time, 'Ultrawear Indoor', 'FC Sportkaffee'),
  ('2026-11-23'::date, '21:00'::time, 'Ultrawear Indoor', 'Vitesse Ampe'),
  ('2026-12-03'::date, '20:00'::time, 'Paniekzaaiers',    'Ultrawear Indoor'),
  ('2026-12-17'::date, '18:00'::time, 'MVC De Kerels',    'Ultrawear Indoor')
) AS v(datum, tijd, thuisploeg, uitploeg)
WHERE NOT EXISTS (
  SELECT 1 FROM wedstrijden w
  WHERE w.datum = v.datum AND w.tijd = v.tijd
    AND w.thuisploeg = v.thuisploeg AND w.uitploeg = v.uitploeg
);

-- ================================================
-- Controleer met:
--   SELECT datum, tijd, thuisploeg, uitploeg FROM wedstrijden
--   WHERE seizoen = '2026-2027' AND type = 'competitie' ORDER BY datum;
-- ================================================
