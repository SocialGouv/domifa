import { type AyantDroiLienParent } from "../types/AyantDroitLienParente.type";

export interface UsagerAyantDroit {
  nom: string;
  prenom: string;
  dateNaissance: Date;
  lien: AyantDroiLienParent;
}
