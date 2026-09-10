import { AyantDroiLienParent } from "@domifa/common";

// Score range a match falls into. Exported to Metabase as ranges rather than a
// yes/no decision, so the "couple" threshold can be re-tuned there without
// re-running the analysis.
export type MatchBucket = "identical" | "very_close" | "doubtful" | "not_found";

// A dependant reduced to what the comparison needs. `birthDay` is the calendar
// day ("yyyy-MM-dd"), `key` the normalized "nom|prenom".
export interface AyantDroitLight {
  nom: string;
  prenom: string;
  lien: AyantDroiLienParent;
  birthDay: string | null;
  key: string;
}

// A dossier reduced to what the comparison needs.
export interface DossierLight {
  uuid: string;
  birthDay: string | null;
  key: string;
  ayantsDroits: AyantDroitLight[];
}

export interface MatchResult {
  score: number;
  candidate: DossierLight | null;
}

// One CSV line: raw counters for a single structure, every counter starting at
// 0. Field names are the CSV column names and are kept verbatim; everything else
// (national totals, ratios, tops) is computed in Metabase after joining on
// `structure`.
export class StructureFamillesRow {
  // Volumes
  dossiers = 0;
  ayants_droit = 0;
  ayants_droit_sans_date_naissance = 0;
  dossiers_avec_conjoint = 0;
  // Conjoints found in the structure
  conjoints_identiques = 0;
  conjoints_tres_proches = 0;
  conjoints_douteux = 0;
  conjoints_non_trouves = 0;
  conjoints_autre_structure = 0;
  // Couples
  couples = 0;
  couples_croises = 0;
  // Children of couples
  couples_memes_enfants = 0;
  couples_enfants_en_partie_communs = 0;
  couples_enfants_differents = 0;
  couples_sans_enfant = 0;
  enfants_comptes_deux_fois = 0;
  // Parents and other adults
  couples_avec_parent = 0;
  enfants_majeurs_avec_dossier = 0;
  parents_avec_dossier = 0;
  // How many people are counted twice
  personnes_comptees_aujourdhui = 0;
  personnes_reelles_estimees = 0;
  gap_personnes = 0;
  gap_pourcentage = 0;

  constructor(public readonly structureId: number) {}
}
