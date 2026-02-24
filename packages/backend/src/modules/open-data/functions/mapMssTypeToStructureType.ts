import { StructureType } from "@domifa/common";

export function mapMssTypeToStructureType(
  mssType: "Association" | "Cias" | "Commune" | "Ccas"
): StructureType {
  switch (mssType) {
    case "Association":
      return "asso";
    case "Ccas":
      return "ccas";
    case "Cias":
      return "cias";
    case "Commune":
      // Les communes ont généralement un CCAS
      return "ccas";
    default:
      return "asso"; // Valeur par défaut
  }
}
