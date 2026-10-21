import { AyantDroiLienParent } from "@domifa/common";

// Score range a match falls into. Exported to Metabase as ranges rather than a
// yes/no decision, so the "couple" threshold can be re-tuned there without
// re-running the analysis.
export type MatchBucket = "identical" | "very_close" | "doubtful" | "not_found";

// Where a declared person lands once looked up among the dossiers: one of the
// match buckets, or "elsewhere" when nothing matches in the structure but an
// identical person has a dossier in another one.
export type CohortOutcome = MatchBucket | "elsewhere";

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
//
// Counters are organised in cohorts: a base and sub-groups whose sum is exactly
// the base (see FAMILLES_COHORTS):
//   ayants_droit          = conjoints + enfants + parents + autres
//   conjoints             = sans date + identiques + très proches + douteux
//                           + autre structure + non trouvés
//   enfants               = sans date + mineurs + majeurs
//   enfants majeurs       = identiques + très proches + douteux
//                           + autre structure + non trouvés
export class StructureFamillesRow {
  // Volumes
  dossiers = 0;
  dossiers_avec_conjoint = 0;
  // Ayants droit, by link
  ayants_droit = 0;
  ayants_droit_conjoints = 0;
  ayants_droit_enfants = 0;
  ayants_droit_parents = 0;
  ayants_droit_autres = 0;
  // Conjoints, looked up among the dossiers
  conjoints_sans_date_naissance = 0;
  conjoints_identiques = 0;
  conjoints_tres_proches = 0;
  conjoints_douteux = 0;
  conjoints_autre_structure = 0;
  conjoints_non_trouves = 0;
  // Enfants, by age
  enfants_sans_date_naissance = 0;
  enfants_mineurs = 0;
  enfants_majeurs = 0;
  // Adult enfants, looked up among the dossiers
  enfants_majeurs_identiques = 0;
  enfants_majeurs_tres_proches = 0;
  enfants_majeurs_douteux = 0;
  enfants_majeurs_autre_structure = 0;
  enfants_majeurs_non_trouves = 0;
  // Parents declared who are identical to a dossier of the structure
  parents_avec_dossier = 0;
  // Couples (conjoint found in the structure)
  couples = 0;
  couples_croises = 0;
  couples_avec_parent = 0;
  // Children of couples
  couples_memes_enfants = 0;
  couples_enfants_en_partie_communs = 0;
  couples_enfants_differents = 0;
  couples_sans_enfant = 0;
  // Children on both dossiers of a couple
  enfants_comptes_deux_fois = 0;
  // Distinct children declared on at least two dossiers of the structure,
  // whether or not those dossiers form a couple (includes the line above)
  enfants_presents_deux_fois = 0;
  // How many people are counted twice
  personnes_comptees_aujourdhui = 0;
  personnes_reelles_estimees = 0;
  gap_personnes = 0;
  gap_pourcentage = 0;

  constructor(public readonly structureId: number) {}
}

// Every counter of the row, i.e. everything but the structure id.
export type RowCounter = Exclude<keyof StructureFamillesRow, "structureId">;
