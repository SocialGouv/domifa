import { type UsagerLienType } from "../types/UsagerLienType.type";
import { type UsagerDecisionStatut } from "../types/decision";

// DTO de lecture pour GET usagers-lien/:usagerRef — volontairement séparé
// de l'interface Usager (jamais fusionné dans le dossier lui-même) pour ne
// rien changer à la sérialisation Cerfa/export/import.
export interface UsagerLienSummary {
  type: UsagerLienType;
  createdAt: Date;
  linkedUsager: {
    uuid: string;
    ref: number;
    customRef: string | null;
    nom: string;
    prenom: string;
    dateNaissance: Date;
    statut: UsagerDecisionStatut;
  };
}
