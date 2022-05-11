import { StructureType } from "../..";

/* TYPE DE STRUCTURE */
export const STRUCTURE_TYPE_LABELS: { [key in StructureType]: string } = {
  asso: "Organisme agrée",
  ccas: "CCAS",
  cias: "CIAS",
};

export const STRUCTURE_TYPE_MAP: StructureType[] = ["asso", "ccas", "cias"];
