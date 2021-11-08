import { AyantDroiLienParent } from "../AyantDroitLienParente.type";

export const LIEN_PARENTE_LABELS: { [key in AyantDroiLienParent]: string } = {
  AUTRE: "Autre personne à la charge du domicilié",
  CONJOINT: "Conjoint.e",
  ENFANT: "Enfant",
  PARENT: "Parent",
};
