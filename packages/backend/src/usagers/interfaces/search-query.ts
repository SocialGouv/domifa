export interface SearchQuery {
  name?: string;
  $or?: any;
  id?: number;
  interactionType?: string;
  typeDom?: string;
  "decision.statut"?: {};
  "decision.dateFin"?: {};
  "lastInteraction.nbCourrier"?: {};
  "lastInteraction.enAttente"?: boolean;
  "lastInteraction.dateInteraction"?: any;
  structureId: number;
}
