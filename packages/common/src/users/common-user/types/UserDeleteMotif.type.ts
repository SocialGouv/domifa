// Motifs partagés entre user_structure et user_supervisor pour un passage
// au statut DELETE (soft delete).
export type UserDeleteMotif =
  | "INACTIF_PLUS_D_UN_AN"
  | "DEPART_STRUCTURE"
  | "EMAIL_GENERIQUE"
  | "COMPTE_TEST";

export const USER_DELETE_MOTIF_VALUES: UserDeleteMotif[] = [
  "INACTIF_PLUS_D_UN_AN",
  "DEPART_STRUCTURE",
  "EMAIL_GENERIQUE",
  "COMPTE_TEST",
];

export const USER_DELETE_MOTIF_LABELS: Record<UserDeleteMotif, string> = {
  INACTIF_PLUS_D_UN_AN: "Compte non utilisé depuis plus d'un an",
  DEPART_STRUCTURE: "Ne travaille plus dans la structure",
  EMAIL_GENERIQUE: "Email générique",
  COMPTE_TEST: "Compte de test",
};
