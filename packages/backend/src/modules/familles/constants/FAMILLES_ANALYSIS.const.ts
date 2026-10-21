import {
  CohortOutcome,
  RowCounter,
  StructureFamillesRow,
} from "../types/famillesAnalysis.types";

// Score = average of the nom score and the prenom score, each
// (1 - levenshtein / longest length) * 100.
export const FAMILLES_SCORE_IDENTIQUE = 100; // strictly identical keys
export const FAMILLES_SCORE_TRES_PROCHE = 75; // one or two typos
export const FAMILLES_SCORE_DOUTEUX = 50; // kept for review, not counted as couples

// At or above this score two dependants (or a dependant and a dossier) are
// treated as the same person: identical or very close. This is the line that
// makes a couple.
export const FAMILLES_SCORE_SAME_PERSON = FAMILLES_SCORE_TRES_PROCHE;

// Path under the S3 bucket root (FileManagerService prepends bucketRootDir).
// The _v2 suffix keeps the first run's file (different columns) untouched.
export const FAMILLES_ANALYSIS_CSV_PATH =
  "analyses/familles_par_structure_v2.csv";

// A cohort: a base and the sub-groups that must add up exactly to it.
export interface FamillesCohort {
  base: RowCounter;
  parts: RowCounter[];
}

export const FAMILLES_COHORTS: FamillesCohort[] = [
  {
    base: "ayants_droit",
    parts: [
      "ayants_droit_conjoints",
      "ayants_droit_enfants",
      "ayants_droit_parents",
      "ayants_droit_autres",
    ],
  },
  {
    base: "ayants_droit_conjoints",
    parts: [
      "conjoints_sans_date_naissance",
      "conjoints_identiques",
      "conjoints_tres_proches",
      "conjoints_douteux",
      "conjoints_autre_structure",
      "conjoints_non_trouves",
    ],
  },
  {
    base: "ayants_droit_enfants",
    parts: [
      "enfants_sans_date_naissance",
      "enfants_mineurs",
      "enfants_majeurs",
    ],
  },
  {
    base: "enfants_majeurs",
    parts: [
      "enfants_majeurs_identiques",
      "enfants_majeurs_tres_proches",
      "enfants_majeurs_douteux",
      "enfants_majeurs_autre_structure",
      "enfants_majeurs_non_trouves",
    ],
  },
];

// Counter incremented for each outcome of a conjoint / of an adult enfant.
export const CONJOINT_COUNTERS: Record<CohortOutcome, RowCounter> = {
  identical: "conjoints_identiques",
  very_close: "conjoints_tres_proches",
  doubtful: "conjoints_douteux",
  elsewhere: "conjoints_autre_structure",
  not_found: "conjoints_non_trouves",
};

export const ENFANT_MAJEUR_COUNTERS: Record<CohortOutcome, RowCounter> = {
  identical: "enfants_majeurs_identiques",
  very_close: "enfants_majeurs_tres_proches",
  doubtful: "enfants_majeurs_douteux",
  elsewhere: "enfants_majeurs_autre_structure",
  not_found: "enfants_majeurs_non_trouves",
};

// CSV column order, also the key order used to serialize each row. Each cohort
// is written base first, then its sub-groups.
export const FAMILLES_ANALYSIS_COLUMNS: (keyof StructureFamillesRow)[] = [
  "structureId",
  "dossiers",
  "dossiers_avec_conjoint",
  "ayants_droit",
  "ayants_droit_conjoints",
  "ayants_droit_enfants",
  "ayants_droit_parents",
  "ayants_droit_autres",
  "conjoints_sans_date_naissance",
  "conjoints_identiques",
  "conjoints_tres_proches",
  "conjoints_douteux",
  "conjoints_autre_structure",
  "conjoints_non_trouves",
  "enfants_sans_date_naissance",
  "enfants_mineurs",
  "enfants_majeurs",
  "enfants_majeurs_identiques",
  "enfants_majeurs_tres_proches",
  "enfants_majeurs_douteux",
  "enfants_majeurs_autre_structure",
  "enfants_majeurs_non_trouves",
  "parents_avec_dossier",
  "couples",
  "couples_croises",
  "couples_avec_parent",
  "couples_memes_enfants",
  "couples_enfants_en_partie_communs",
  "couples_enfants_differents",
  "couples_sans_enfant",
  "enfants_comptes_deux_fois",
  "enfants_presents_deux_fois",
  "personnes_comptees_aujourdhui",
  "personnes_reelles_estimees",
  "gap_personnes",
  "gap_pourcentage",
];
