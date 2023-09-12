import { type UsagerDecisionMotif } from "..";

export const MOTIFS_REFUS_LABELS: {
  [key in UsagerDecisionMotif]?: string;
} = {
  HORS_AGREMENT: "En dehors des critères du public domicilié",
  LIEN_COMMUNE: "Absence de lien avec la commune",
  SATURATION: "Nombre maximal domiciliations atteint",
};

export const MOTIFS_REFUS_LABELS_MAP: UsagerDecisionMotif[] = [
  "AUTRE",
  "HORS_AGREMENT",
  "LIEN_COMMUNE",
  "SATURATION",
];
