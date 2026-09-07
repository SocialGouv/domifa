import { AyantDroiLienParent } from "@domifa/common";

// Bucket a Levenshtein score falls into. Exported to Metabase as ranges rather
// than a yes/no decision, so the "couple" threshold can be re-tuned there
// without re-running the analysis.
export type FamillesMatchBucket =
  | "identique"
  | "tres_proche"
  | "douteux"
  | "non_trouve";

// A dependant reduced to what the comparison needs. `dobDay` is the calendar
// day in Europe/Paris ("yyyy-MM-dd"), `key` the normalized "nom|prenom".
export interface AyantDroitLite {
  nom: string;
  prenom: string;
  lien: AyantDroiLienParent;
  dobDay: string | null;
  key: string;
}

// A dossier reduced to what the comparison needs.
export interface DossierLite {
  uuid: string;
  dobDay: string | null;
  key: string;
  ayantsDroits: AyantDroitLite[];
}

export interface FamillesMatchResult {
  score: number;
  candidate: DossierLite | null;
}

// One CSV line: raw counters for a single structure. Everything else (national
// totals, ratios, tops) is computed in Metabase after joining on `structure`.
export interface StructureFamillesRow {
  structureId: number;
  // Volumes
  dossiers: number;
  ayants_droit: number;
  ayants_droit_sans_date_naissance: number;
  dossiers_avec_conjoint: number;
  // Conjoints found in the structure
  conjoints_identiques: number;
  conjoints_tres_proches: number;
  conjoints_douteux: number;
  conjoints_non_trouves: number;
  conjoints_autre_structure: number;
  // Couples
  couples: number;
  couples_croises: number;
  // Children of couples
  couples_memes_enfants: number;
  couples_enfants_en_partie_communs: number;
  couples_enfants_differents: number;
  couples_sans_enfant: number;
  enfants_comptes_deux_fois: number;
  // Parents and other adults
  couples_avec_parent: number;
  enfants_majeurs_avec_dossier: number;
  parents_avec_dossier: number;
  // How many people are counted twice
  personnes_comptees_aujourdhui: number;
  personnes_reelles_estimees: number;
  gap_personnes: number;
  gap_pourcentage: number;
}
