// Database types
export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'speler';
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
