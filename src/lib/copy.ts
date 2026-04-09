// Copy constants for the application
export const COPY = {
  // Hero section
  HERO_TITLE: 'Ultrawear Indoor',
  HERO_SUBTITLE: 'Volg de prestaties van ons indoor voetbalteam',

  // Home stats
  HOME_STAT_TOPSCORER: 'Topscorer',
  HOME_STAT_ATTENDANCE: 'Aanwezigheid',
  HOME_STAT_NEXT_MATCH: 'Volgende Wedstrijd',
  HOME_STAT_GOALS_PER_GAME: 'Doelpunten per wedstrijd',
  HOME_STAT_MOST_GAMES: 'Meeste wedstrijden',
  HOME_STAT_LOYAL_PLAYER: 'Meest trouwe speler',
  HOME_STAT_LOYAL_PLAYERS: 'Meest trouwe spelers',

  // Home overview
  HOME_STATS_OVERVIEW_TITLE: 'Seizoen Overzicht',
  HOME_TOTAL_GOALS: 'Totaal Doelpunten',
  HOME_AVG_PER_MATCH: 'Gemiddeld per wedstrijd',
  HOME_ACTIVE_PLAYERS: 'Actieve Spelers',
  HOME_TOTAL_MATCHES: 'Totaal Wedstrijden',

  // Home CTA
  HOME_CTA_FULL_RANKINGS: 'Bekijk volledige ranglijst',
  HOME_CTA_FULL_RANKINGS_SUB: 'Ontdek alle statistieken',
  HOME_CTA_DETAILED_STATS: 'Gedetailleerde statistieken',
  HOME_CTA_DETAILED_STATS_SUB: 'Diepgaande analyse',

  // Facebook
  FACEBOOK_LINK_TEXT: 'Volg ons op Facebook',
  FACEBOOK_LINK_SUBTITLE: 'Blijf op de hoogte van het laatste nieuws',

  // Home next match
  HOME_NEXT_MATCH_TITLE: 'Volgende Wedstrijd',
  MATCH_THUIS: 'Thuis',
  MATCH_UIT: 'Uit',
  MATCH_VS: 'vs',
  MATCH_AT: '@',
  HOME_NEXT_MATCH_THUIS: 'Thuiswedstrijd',
  HOME_NEXT_MATCH_UIT: 'Uitwedstrijd',

  // Form messages
  FORM_SUCCESS: 'Wedstrijd succesvol opgeslagen!',
  FORM_ERROR: 'Fout bij opslaan',
  LOADING: 'Laden...',

  // Form labels
  FORM_TITLE: 'Wedstrijd Invoeren',
  FORM_SUBTITLE: 'Voer de wedstrijdgegevens en spelersstatistieken in',

  // Live stats
  FORM_LIVE_STATS_TITLE: 'Live Statistieken',
  FORM_LIVE_PRESENT: 'Aanwezig',
  FORM_LIVE_GOALS: 'Doelpunten',
  FORM_LIVE_CORNERS: 'Corners',
  FORM_LIVE_PENALTIES: 'Penalties',

  // Labels
  LABEL_WEDSTRIJD: 'Wedstrijd',
  LABEL_SELECT_MATCH: 'Selecteer wedstrijd',
  LABEL_TYPE: 'Type',
  LABEL_DATUM: 'Datum',
  LABEL_TIJD: 'Tijd',
  LABEL_TEGENSTANDER: 'Tegenstander',
  LABEL_TEGENSTANDER_PLACEHOLDER: 'bijv. FC Test',
  LABEL_SPELER: 'Speler',
  LABEL_AANWEZIG: 'Aanwezig',
  LABEL_GOALS: 'Doelpunten',
  LABEL_PENALTIES: 'Penalties',
  LABEL_CORNERS: 'Corners',
  LABEL_OPMERKINGEN: 'Opmerkingen',
  LABEL_OPMERKINGEN_PLACEHOLDER: 'Eventuele opmerkingen over de wedstrijd...',

  // Buttons
  BTN_SAVE_MATCH: 'Wedstrijd Opslaan',

  // Form states
  FORM_SAVING: 'Opslaan...',

  // Types
  TYPE_COMPETITIE: 'Competitie',
  TYPE_COMPETITIE_ICON: '🏆',
  TYPE_BEKER: 'Beker',
  TYPE_BEKER_ICON: '🏅',
  TYPE_OEFENWEDSTRIJD: 'Oefenwedstrijd',
  TYPE_OEFENWEDSTRIJD_ICON: '⚽',

  // Home top scorers
  HOME_TOP_SCORERS_TITLE: 'Topscorers',

  // Stats page
  STATS_PAGE_TITLE: 'Speler Statistieken',
  STATS_PAGE_SUBTITLE: 'Bekijk de prestaties van alle spelers',

  // Form sections
  FORM_SECTION_PLAYERS: 'Spelers',

  // Stats
  STATS_RANKINGS_TITLE: 'Ranglijst',
  STATS_PLAYERS_COUNT: 'spelers',
  STATS_DETAILED_TITLE: 'Gedetailleerde Statistieken',
  STATS_DETAILED_SUBTITLE: 'Diepgaande analyse van spelersprestaties',
  STATS_FILTER_ALL: 'Alle wedstrijden',
  STATS_FILTER_COMPETITIE: 'Competitie',
  STATS_FILTER_BEKER: 'Beker',
  STATS_SECTION_TOPSCORERS: 'Topscorers',
  STATS_SECTION_GOALS_PER_GAME: 'Doelpunten per wedstrijd',
  STATS_SECTION_CORNERS: 'Meeste Corners',
  STATS_SECTION_PENALTIES: 'Meeste Penalties',
  STATS_SECTION_ATTENDANCE: 'Aanwezigheid',
  LOADING_STATS: 'Statistieken laden...',
};

// Match type configuration
export const getMatchTypeConfig = (type: string) => {
  const configs = {
    'competitie': {
      color: '#FFD700',
      icon: COPY.TYPE_COMPETITIE_ICON,
      label: COPY.TYPE_COMPETITIE
    },
    'beker': {
      color: '#C0C0C0',
      icon: COPY.TYPE_BEKER_ICON,
      label: COPY.TYPE_BEKER
    },
    'oefenwedstrijd': {
      color: '#CD7F32',
      icon: COPY.TYPE_OEFENWEDSTRIJD_ICON,
      label: COPY.TYPE_OEFENWEDSTRIJD
    }
  };

  return configs[type as keyof typeof configs] || {
    color: '#666',
    icon: '⚽',
    label: type
  };
};