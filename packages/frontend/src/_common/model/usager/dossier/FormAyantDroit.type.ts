import { AyantDroiLienParent } from "@domifa/common";

export interface UsagerFormAyantDroit {
  uuid: string;
  dateNaissance: string;
  lien: AyantDroiLienParent;
  nom: string;
  prenom: string;
}
