export type MessageSmsReminders =
  | "echeanceDeuxMois" // Fin de dom à venir
  | "dernierPassageTroisMois" // N'est pas passé depuis 3 mois, radiation à venir
  | "decision"; // Validation ou non d'une demande
