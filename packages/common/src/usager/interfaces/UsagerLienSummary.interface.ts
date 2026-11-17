import { type UsagerLienType } from "../types/UsagerLienType.type";
import { type UsagerDecisionStatut } from "../types/decision";

// Read DTO for GET usagers-lien/:usagerRef — deliberately kept separate
// from the Usager interface (never merged into the dossier itself) so it
// doesn't change Cerfa/export/import serialization.
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
