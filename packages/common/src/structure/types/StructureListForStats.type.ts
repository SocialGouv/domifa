import { type Structure } from "../interfaces";

// Structure: attributs exposés par `admin/national-stats/metabase-get-structures`,
// pour alimenter le sélecteur de structure du portail de pilotage
export type StructureListForStats = Pick<
  Structure,
  "id" | "nom" | "ville" | "codePostal"
>;
