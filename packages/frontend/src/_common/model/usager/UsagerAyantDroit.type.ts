import { AyantDroiLienParent } from "./AyantDroitLienParente.type";

export type UsagerAyantDroit = {
  nom: string;
  prenom: string;
  dateNaissance: string | Date; // TODO: convertir en DATE
  lien: AyantDroiLienParent;
};
