// ================================================
// SEIZOENSARCHIEF — afsluitende samenvatting per seizoen
// ================================================
// Gestructureerde eindbalans per seizoen: de cijfers die NIET uit de databank
// af te leiden zijn (eindklassering, redactionele bedanktekst) leven hier. De
// homepage bouwt hier een sport-editoriale seizoensgrafiek mee (grote positie,
// cijfers eromheen) voor het geselecteerde seizoen — alleen als er een entry is.
//
// Nieuw seizoen afsluiten? Voeg een entry toe. Ouder seizoen erbij? Zet de
// historische balans hier met hetzelfde label als in de wedstrijden.

export interface SeizoenSamenvatting {
  /** Eindpositie als getal, bv. 2. */
  positie: number;
  /** Achtervoegsel voor de positie, bv. 'DE' of 'STE'. */
  positieSuffix: string;
  /** Medaille-emoji (optioneel), bv. '🥈'. */
  medaille?: string;
  /** Korte omschrijving van de prestatie, bv. 'vice-kampioen'. */
  prestatie: string;
  gespeeld: number;
  gewonnen: number;
  gelijk: number;
  verloren: number;
  doelsaldo: number;
  topscorerNaam?: string;
  topscorerGoals?: number;
  /** Afsluitende bedanktekst. */
  bedankt: string;
}

export const SEIZOEN_ARCHIEF: Record<string, SeizoenSamenvatting> = {
  '2025-2026': {
    positie: 2,
    positieSuffix: 'DE',
    medaille: '🥈',
    prestatie: 'vice-kampioen',
    gespeeld: 27,
    gewonnen: 18,
    gelijk: 1,
    verloren: 8,
    doelsaldo: 61,
    topscorerNaam: 'Wanny',
    topscorerGoals: 60,
    bedankt: 'Bedankt aan álle spelers voor dit mooie seizoen — geknokt tot de laatste match.',
  },
};

export const seizoenSamenvatting = (seizoen: string): SeizoenSamenvatting | undefined =>
  SEIZOEN_ARCHIEF[seizoen];
