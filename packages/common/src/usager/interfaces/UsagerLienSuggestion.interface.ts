import { type UsagerDecisionStatut } from "../types/decision";

// DTO de réponse pour GET usagers-lien/:usagerRef/suggestion.
export interface UsagerLienSuggestion {
  ayantDroitUuid: string;
  candidate: {
    uuid: string;
    ref: number;
    customRef: string | null;
    nom: string;
    prenom: string;
    dateNaissance: Date;
    statut: UsagerDecisionStatut;
  };
  alreadyLinkedTo: { nom: string; prenom: string } | null;
}
