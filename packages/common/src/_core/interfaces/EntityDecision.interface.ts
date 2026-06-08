// Generic shape for a status change decision applied to an entity
// (structure, user_structure, user_supervisor, ...). Each entity specialises
// the statut and motif type unions but the storage shape is shared.
export interface EntityDecision<
  TStatut extends string,
  TMotif extends string = never
> {
  uuid: string;
  dateDecision: Date;
  statut: TStatut;
  motif?: TMotif | null;
  motifDetails?: string;
  userId: number;
  userName: string;
}
