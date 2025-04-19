import { Structure } from "@domifa/common";

export type StructureListForStats = Pick<
  Structure,
  "ville" | "nom" | "codePostal" | "id"
>;
