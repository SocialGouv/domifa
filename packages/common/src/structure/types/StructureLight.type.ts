import { type StructureCommon } from "./StructureCommon.type";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureLight = Omit<
  StructureCommon,
  "telephone" | "email" | "responsable"
>;
