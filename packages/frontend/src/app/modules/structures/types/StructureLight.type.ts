import { StructureCommon } from "@domifa/common";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureLight = Omit<
  StructureCommon,
  "telephone" | "email" | "responsable"
>;
