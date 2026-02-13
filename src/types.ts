export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: 'speler' | 'admin' | 'coach';
  created_at: string;
}

export interface Wedstrijd {
  id: string;
  datum: string;
  tijd: string;
  thuisploeg: string;
  uitploeg: string;
  uitslag?: string;
  opmerkingen?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
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

export interface AggregatedStats {
  speler_naam: string;
  aanwezig: number;
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
  opmerkingen?: string;
  spelers: {
    naam: string;
    aanwezig: boolean;
    doelpunten: number;
    penalty: number;
    corner: number;
  }[];
}

export const SPELERS = [
  "Stan",
  "Rette",
  "Wanny",
  "Arne",
  "Emile",
  "Vik",
  "Nicolas",
  "Mats",
  "Brian",
  "Slekke",
  "Didier",
  "Elias",
  "Toby",
  "Pieter"
] as const;

export type SpelerNaam = typeof SPELERS[number];
