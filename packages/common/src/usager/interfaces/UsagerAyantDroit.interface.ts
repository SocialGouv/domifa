import { type AyantDroiLienParent } from "../types/AyantDroitLienParente.type";

export interface UsagerAyantDroit {
  uuid: string;
  nom: string;
  prenom: string;
  dateNaissance: Date;
  lien: AyantDroiLienParent;
}
