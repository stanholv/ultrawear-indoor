// ================================================
// SEIZOEN (SEASON) HELPERS
// ================================================
// Eén seizoen loopt van augustus t/m juli en heeft een label 'YYYY-YYYY'
// (bv. '2025-2026'). Wedstrijden krijgen bij het aanmaken een `seizoen`
// (zie useWedstrijden); bestaande data is via de migratie op '2025-2026' gezet.
//
// De app filtert alle statistieken, uitslagen en records op het geselecteerde
// seizoen. De lijst met beschikbare seizoenen wordt afgeleid uit de data, zodat
// oudere seizoenen die later worden geïmporteerd vanzelf verschijnen.

/**
 * Het seizoen waaraan nieuwe wedstrijden standaard worden gekoppeld en dat de
 * app als "actueel" toont. Pas dit aan wanneer een nieuw seizoen begint.
 */
export const HUIDIG_SEIZOEN = '2026-2027';

/**
 * De maand (1-12) waarop een nieuw seizoen begint. Augustus = 8.
 * Een wedstrijd in aug–dec hoort bij seizoen [jaar, jaar+1];
 * een wedstrijd in jan–jul hoort bij seizoen [jaar-1, jaar].
 */
const SEIZOEN_START_MAAND = 8;

/**
 * Leidt het seizoenslabel af uit een wedstrijddatum ('YYYY-MM-DD').
 * Valt terug op HUIDIG_SEIZOEN als de datum ontbreekt of ongeldig is.
 */
export const seizoenVanDatum = (datum?: string | null): string => {
  if (!datum) return HUIDIG_SEIZOEN;
  const d = new Date(datum);
  if (isNaN(d.getTime())) return HUIDIG_SEIZOEN;
  const jaar = d.getFullYear();
  const maand = d.getMonth() + 1; // getMonth is 0-based
  const startJaar = maand >= SEIZOEN_START_MAAND ? jaar : jaar - 1;
  return `${startJaar}-${startJaar + 1}`;
};

/**
 * Korte weergave van een seizoenslabel, bv. '2025-2026' → "'25-'26".
 * Handig voor compacte selectors op mobiel.
 */
export const seizoenKort = (seizoen: string): string => {
  const [van, tot] = seizoen.split('-');
  if (!van || !tot) return seizoen;
  return `'${van.slice(-2)}-'${tot.slice(-2)}`;
};

/**
 * Sorteert seizoenslabels van nieuw naar oud (meest recente eerst).
 */
export const sorteerSeizoenenAflopend = (seizoenen: string[]): string[] =>
  [...seizoenen].sort((a, b) => b.localeCompare(a));

/**
 * Het seizoen van een wedstrijd, robuust: gebruikt de opgeslagen `seizoen` en
 * valt terug op afleiden uit de datum voor (nog) niet-getagde rijen. Zo werkt
 * de app ook vóór de migratie of voor per ongeluk lege waarden.
 */
export const seizoenVanWedstrijd = (w: { seizoen?: string | null; datum?: string | null }): string =>
  w.seizoen || seizoenVanDatum(w.datum);

/**
 * Bouwt de lijst met beschikbare seizoenen uit een set wedstrijden.
 * HUIDIG_SEIZOEN zit er altijd bij (ook als er nog geen matchen voor zijn),
 * zodat je meteen naar het nieuwe seizoen kunt schakelen. Nieuw → oud.
 */
export const beschikbareSeizoenen = (
  seizoenen: Array<string | null | undefined>,
): string[] => {
  const set = new Set<string>([HUIDIG_SEIZOEN]);
  for (const s of seizoenen) {
    if (s) set.add(s);
  }
  return sorteerSeizoenenAflopend([...set]);
};
