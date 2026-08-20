import { Usager } from "@domifa/common";

export const USAGER_LIGHT_ATTRIBUTES: (keyof Usager)[] = [
  "uuid",
  "ref",
  "customRef",
  //"structureId",
  "nom",
  "prenom",
  "surnom",
  "sexe",
  "dateNaissance",
  // "email",
  "decision",
  // "datePremiereDom",
  "statut",
  "typeDom",
  "pinnedNote",
  // "entretien",
  "etapeDemande",
  "rdv",
  // "numeroDistribution",
  "lastInteraction",
  "options",
  // NE PAS RETIRER `historique` sans déplacer d'abord le calcul de l'échéance
  // côté serveur. `setUsagerInformation` remet bien `historique: []`, mais
  // seulement APRÈS avoir appelé `getDecisionDeadline()` sur l'objet brut, et
  // celui-ci déréférence `historique.length` sans garde dès qu'un dossier est
  // en RENOUVELLEMENT et pas encore décidé — le geste métier le plus courant.
  // L'absence de la colonne fait donc planter le reducer, donc toute la liste.
  // Les endpoints de liste rognent chaque entrée aux quatre champs utiles
  // (`filterHistorique`), ce qui suffit à `getDecisionDeadline`.
  "historique",
  "referrerId",
  "ayantsDroits",
  //"villeNaissance",
  "telephone",
  // "langue",
  // "contactByPhone",
];
