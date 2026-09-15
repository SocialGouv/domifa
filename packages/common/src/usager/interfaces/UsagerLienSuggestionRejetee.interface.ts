import { type UserStructureResume } from "../../users/user-structure";

// Une ligne de la table usager_lien_suggestion_rejetee : trace le "Ce n'est
// pas la même personne" pour un (usager, ayant droit) donné, afin que la
// suggestion de matching ne réapparaisse plus.
export interface UsagerLienSuggestionRejetee {
  usagerUUID: string;
  ayantDroitUUID: string;
  structureId: number;
  createdBy: UserStructureResume;
}
