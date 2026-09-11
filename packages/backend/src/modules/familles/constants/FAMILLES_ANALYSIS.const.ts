import { StructureFamillesRow } from "../types/famillesAnalysis.types";

// Score = (1 - levenshtein / longest key length) * 100.
export const FAMILLES_SCORE_IDENTIQUE = 100; // strictly identical keys
export const FAMILLES_SCORE_TRES_PROCHE = 75; // one or two typos
export const FAMILLES_SCORE_DOUTEUX = 50; // kept for review, not counted as couples

// At or above this score two dependants (or a dependant and a dossier) are
// treated as the same person: identical or very close. This is the line that
// makes a couple.
export const FAMILLES_SCORE_SAME_PERSON = FAMILLES_SCORE_TRES_PROCHE;

// Path under the S3 bucket root (FileManagerService prepends bucketRootDir).
export const FAMILLES_ANALYSIS_CSV_PATH = "analyses/familles_par_structure.csv";

// CSV column order, also the key order used to serialize each row.
export const FAMILLES_ANALYSIS_COLUMNS: (keyof StructureFamillesRow)[] = [
  "structureId",
  "dossiers",
  "ayants_droit",
  "ayants_droit_sans_date_naissance",
  "dossiers_avec_conjoint",
  "conjoints_identiques",
  "conjoints_tres_proches",
  "conjoints_douteux",
  "conjoints_non_trouves",
  "conjoints_autre_structure",
  "couples",
  "couples_croises",
  "couples_memes_enfants",
  "couples_enfants_en_partie_communs",
  "couples_enfants_differents",
  "couples_sans_enfant",
  "enfants_comptes_deux_fois",
  "couples_avec_parent",
  "enfants_majeurs_avec_dossier",
  "parents_avec_dossier",
  "personnes_comptees_aujourdhui",
  "personnes_reelles_estimees",
  "gap_personnes",
  "gap_pourcentage",
];
