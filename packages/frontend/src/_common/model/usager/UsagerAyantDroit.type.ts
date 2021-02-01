import { AyantDroiLienParent } from "./AyantDroitLienParente.type";

export type UsagerAyantDroit = {
  nom: string;
  prenom: string;
  dateNaissance: string; // TODO: convertir en DATE
  lien: AyantDroiLienParent;
};
