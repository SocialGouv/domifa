export interface SearchQuery {
  name?: string;
  $or?: any[];
  interactionType?: string;
  interactionStatut?: boolean;
  "decision.statut"?: {};
  "lastInteraction.nbCourrier"?: {};
  structureId?: number;
}
