import { type StructureType } from "../types";

export const STRUCTURE_TYPE_LABELS: { [key in StructureType]: string } = {
  asso: "Organisme agréé",
  ccas: "CCAS / Mairie / Commune",
  cias: "CIAS",
};

export const STRUCTURE_TYPE_MAP: StructureType[] = ["asso", "ccas", "cias"];
