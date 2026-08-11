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
  // `historique` volontairement absent : c'est la colonne la plus lourde de la
  // table (une entrée par décision jamais prise, texte libre compris) et tous
  // les consommateurs de cette liste la remplacent par [] à la réception
  // (`setUsagerInformation`). La page profil la charge par son propre endpoint.
  "referrerId",
  "ayantsDroits",
  //"villeNaissance",
  "telephone",
  // "langue",
  // "contactByPhone",
];
