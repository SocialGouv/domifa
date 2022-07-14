import { UsagerTable } from "../../../entities";

export const USAGER_LIGHT_ATTRIBUTES: (keyof UsagerTable)[] = [
  "uuid",
  "ref",
  "customRef",
  "structureId",
  "nom",
  "prenom",
  "surnom",
  "sexe",
  "dateNaissance",
  "email",
  "decision",
  "datePremiereDom",
  "typeDom",
  "entretien",
  "etapeDemande",
  "rdv",
  "lastInteraction",
  "options",
  "historique",
  "ayantsDroits",
  "villeNaissance",
  "phone",
  "langue",
  "preference",
  "notes",
];
