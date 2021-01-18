import { StructureCommon } from "./StructureCommon.type";

// Structure: attributs publics (retournés au frontend via AppAuthUser)
export type StructureLight = Omit<
  StructureCommon,
  "phone" | "email" | "responsable"
>;
