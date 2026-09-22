import { type UserStructureResume } from "../../users/user-structure";

// A row of the usager_lien_suggestion_rejetee table: tracks the "This
// isn't the same person" dismissal for a given (usager, ayant droit) pair,
// so the matching suggestion doesn't reappear.
export interface UsagerLienSuggestionRejetee {
  usagerUUID: string;
  ayantDroitUUID: string;
  structureId: number;
  createdBy: UserStructureResume;
}
