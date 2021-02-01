export interface SearchQuery {
  customRef?: any;
  name?: string;
  $or?: any;
  id?: {};
  interactionType?: string;
  typeDom?: string;
  "decision.statut"?: {};
  "decision.dateFin"?: {};
  "lastInteraction.enAttente"?: boolean;
  "lastInteraction.dateInteraction"?: any;
  structureId: number;
}
