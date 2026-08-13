// ================================================
// SEIZOENSARCHIEF — afsluitende samenvatting per seizoen
// ================================================
// De cijfers die NIET uit de databank af te leiden zijn (eindklassering in de
// competitie, aantal hat-tricks, redactionele bedanktekst) leven hier, per
// seizoen. De afsluitkaart op de homepage toont de samenvatting van het
// geselecteerde seizoen — en alleen als er een entry bestaat.
//
// Nieuw seizoen afsluiten? Voeg een entry toe met de eindstand. Ouder seizoen
// erbij? Zet de historische samenvatting hier neer met hetzelfde label als in
// de wedstrijden (bv. '2024-2025').

export interface SeizoenSamenvatting {
  /** Kop, bv. '🥈 2de plaats!' */
  eindstand: string;
  /** Regel met het seizoensrecord, bv. '27 matchen · 18 gewonnen · …'. */
  record: string;
  /** Optionele topscorer-badge, bv. '🐐 Topscorer: Wanny — 60 goals, 12 hat-tricks'. */
  topscorer?: string;
  /** Afsluitende bedanktekst. */
  bedankt: string;
}

export const SEIZOEN_ARCHIEF: Record<string, SeizoenSamenvatting> = {
  '2025-2026': {
    eindstand: '🥈 2de plaats!',
    record: '27 matchen · 18 gewonnen · 1 gelijk · 8 verloren · +61 doelsaldo',
    topscorer: '🐐 Topscorer: Wanny — 60 goals, 12 hat-tricks',
    bedankt: 'Bedankt aan álle spelers voor dit mooie seizoen — geknokt tot de laatste match! 🔴⚫',
  },
};

export const seizoenSamenvatting = (seizoen: string): SeizoenSamenvatting | undefined =>
  SEIZOEN_ARCHIEF[seizoen];
