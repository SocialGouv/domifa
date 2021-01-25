export interface Decision {
  dateDebut: Date;
  dateFin: Date;
  dateDecision: Date;

  typeDom: string;
  statut: string;

  motif: string;
  motifDetails: string;

  orientation: string;
  orientationDetails: string;

  userId: number;
  userName: string;
}
