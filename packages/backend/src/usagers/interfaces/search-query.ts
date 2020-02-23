export interface SearchQuery {
  name?: string;
  $or?: any[];
  interactionType?: string;
  typeDom?: string;
  interactionStatut?: boolean;
  "decision.statut"?: {};
  "decision.dateFin"?: {};
  "lastInteraction.nbCourrier"?: {};
  "lastInteraction.dateInteraction"?: {};
  structureId: number;
}
