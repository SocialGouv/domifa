import { UsagerAyantDroit, UsagerPreferenceContact, UsagerSexe } from "..";
import { Telephone } from "../../telephone";

export type UsagerEtatCivilFormData = {
  sexe: UsagerSexe;
  nom: string;
  prenom: string;
  surnom: string;
  dateNaissance: Date;
  villeNaissance: string;
  langue: string | null;
  customRef: string;
  email: string;
  telephone: Telephone;
  preference?: UsagerPreferenceContact;
  ayantsDroits: UsagerAyantDroit[];
};
