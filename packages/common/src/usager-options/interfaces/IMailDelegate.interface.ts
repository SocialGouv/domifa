export interface IMailDelegate {
  nom: string | null;
  dateDebut: Date | null;
  dateFin: Date | null;
  isExpired?: boolean;
  isInactive?: boolean;
}
