import { StructureCommon } from "./StructureCommon.type";

// Structure: attributs publics (retournés au frontend via UserStructureAuthenticated)
export type StructureLight = Omit<
  StructureCommon,
  "phone" | "email" | "responsable"
>;
