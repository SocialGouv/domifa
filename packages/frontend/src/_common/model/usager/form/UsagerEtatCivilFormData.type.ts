import { UsagerAyantDroit, UsagerSexe } from "@domifa/common";

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
  numeroDistribution: string | null;
  email: string;
  nationalite: string | null;
  telephone: Telephone;
  contactByPhone: boolean;
  ayantsDroits: UsagerAyantDroit[];
};
