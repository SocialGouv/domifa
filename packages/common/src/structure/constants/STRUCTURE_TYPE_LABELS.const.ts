import { type StructureType } from "../types";

export const STRUCTURE_TYPE_LABELS: { [key in StructureType]: string } = {
  asso: "Organisme agrée",
  ccas: "CCAS",
  cias: "CIAS",
  mairie: "Mairie",
};

export const STRUCTURE_TYPE_MAP: StructureType[] = [
  "asso",
  "ccas",
  "cias",
  "mairie",
];
