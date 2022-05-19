import { AyantDroiLienParent } from "./AyantDroitLienParente.type";

export type UsagerAyantDroit = {
  nom: string;
  prenom: string;
  dateNaissance: Date | null;
  lien: AyantDroiLienParent | null;
};
