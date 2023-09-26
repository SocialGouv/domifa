import { StructureType } from "@domifa/common";

export const STRUCTURE_TYPE_LABELS: { [key in StructureType]: string } = {
  asso: "Organisme agrée",
  ccas: "CCAS",
  cias: "CIAS",
};

export const STRUCTURE_TYPE_MAP: StructureType[] = ["asso", "ccas", "cias"];
