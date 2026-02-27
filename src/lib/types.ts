// Database types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'speler';
  speler_naam?: string;
  rugnummer?: number;
  positie?: string;
  bio?: string;
  created_at: string;
}

export interface Wedstrijd {
  id: string;
  datum: string;
  tijd: string;
  thuisploeg: string;
  uitploeg: string;
  uitslag: string;
  type?: 'competitie' | 'beker' | 'oefenwedstrijd';
  opmerkingen?: string;
  created_at: string;
}

export interface SpelerStat {
  id: string;
  wedstrijd_id: string;
  speler_naam: string;
  aanwezig: boolean;
  doelpunten: number;
  penalty: number;
  corner: number;
  created_at: string;
}

// Aggregated stats (from useStats hook)
export interface AggregatedStats {
  speler_naam: string;
  aanwezig: number;
  doelpunten: number;
  penalty: number;
  corner: number;
}

// Form input types
export interface SpelerInput {
  naam: string;
  aanwezig: boolean;
  doelpunten: number;
  penalty: number;
  corner: number;
}

export interface WedstrijdFormData {
  datum: string;
  tijd: string;
  thuisploeg: string;
  uitploeg: string;
  uitslag: string;
  type?: 'competitie' | 'beker' | 'oefenwedstrijd';
  opmerkingen?: string;
  spelers: SpelerInput[];
}

// Player Profile (v2.5)
export interface PlayerProfile {
  speler_naam: string;
  rugnummer?: number;
  positie?: string;
  bio?: string;
  // Gekoppeld account (optioneel)
  profile_id?: string;
  full_name?: string;
}

// Review (v2.5)
export interface Review {
  id: string;
  speler_naam: string;
  score: number; // 1-5
  commentaar?: string;
  reviewer_naam?: string;
  ip_adres?: string;
  created_at: string;
}

// Posities
export const POSITIES = [
  'Keeper',
  'Verdediger',
  'Middenvelder',
  'Aanvaller',
] as const;

export type Positie = typeof POSITIES[number];

// Constants
export const SPELERS = [
  'Stan',
  'Rette',
  'Wanny',
  'Arne',
  'Emile',
  'Vik',
  'Nicolas',
  'Mats',
  'Brian',
  'Slekke',
  'Didier',
  'Elias',
  'Toby',
  'Pieter',
] as const;
