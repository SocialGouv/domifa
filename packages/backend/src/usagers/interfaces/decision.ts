export interface Decision{
  dateDebut: Date,
  dateFin: Date,
  dateDemande: Date,
  dateInstruction: Date,
  statut: string,
  motif: string,
  userId: number,
  agent: string,
  motifDetails: string,
  orientation: number,
  orientationDetails: string
}
