export interface Decision {
  dateDebut: Date;
  dateFin: Date;
  dateDecision: Date;

  statut: string;

  motif: string;
  motifDetails: string;
  orientation: string;
  orientationDetails: string;

  userId: number;
  userName: string;

  typeDom: string;
}
