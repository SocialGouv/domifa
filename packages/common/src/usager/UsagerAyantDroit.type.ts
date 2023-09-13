import { AyantDroiLienParent } from "./AyantDroitLienParente.type";

export interface UsagerAyantDroit {
  nom: string;
  prenom: string;
  dateNaissance: Date;
  lien: AyantDroiLienParent;
}
