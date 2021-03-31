import { StructureDocKeys } from "./StructureDocKeys.type";

export const StructureDocLabels: {
  [key in StructureDocKeys]: string;
} = {
  // DATES UTILES
  DATE_JOUR: "Date du jour (ex: 20/12/2020)",
  DATE_JOUR_HEURE: "Date et heure du jour (ex: 20/12/2020 à 10h30)",
  DATE_JOUR_LONG: "Date du jour format long (ex: 20 décembre 2020)",

  // Responsable
  RESPONSABLE_NOM: "Nom du responsable",
  RESPONSABLE_PRENOM: "Prénom du responsable",
  RESPONSABLE_FONCTION: "Fonction du responsable",

  // Structure
  STRUCTURE_NOM: "Nom de la structure",
  STRUCTURE_TYPE: "Type de structure",
  STRUCTURE_ADRESSE: "Adresse de la structure",
  STRUCTURE_COMPLEMENT_ADRESSE: "Complément d'adresse",
  STRUCTURE_VILLE: "Ville de la structure",
  STRUCTURE_CODE_POSTAL: "Code-postal de la structure",

  // Si courrier différent
  STRUCTURE_COURRIER_ADRESSE: "Adresse de réception du courrier",
  STRUCTURE_COURRIER_VILLE: "Ville de réception courrier",
  STRUCTURE_COURRIER_CODE_POSTAL: "Code-postal de réception courrier",

  // USAGER INFOS
  USAGER_REF: "Référence dossier",
  USAGER_CUSTOM_REF: "Identifiant personnalisé",
  USAGER_CIVILITE: "Civilité de l'usager",
  USAGER_NOM: "Nom de l'usager",
  USAGER_PRENOM: "Prénom de l'usager",
  USAGER_SURNOM: "Nom d'usage / Surnom",
  USAGER_DATE_NAISSANCE: "Date naissance",
  USAGER_LIEU_NAISSANCE: "Lieu naissance",

  // CONTACT USAGER
  USAGER_PHONE: "Numéro de téléphone",
  USAGER_EMAIL: "Adresse email",

  // STATUT ET TYPE DE DOM
  STATUT_DOM: "Statut de la domiciliation: actif, radié, refusé, en attente",
  TYPE_DOM: "Type de domiciliation : première domiciliation ou renouvellement",

  // REFUS / RADIATION
  MOTIF_RADIATION: "Motif de la radiation",
  DATE_RADIATION: "Date de la radiation",
  // DATES DOMICILIATION
  DATE_DEBUT_DOM: "Date de Début de la domiciliation (ex: 12/10/2020)",
  DATE_FIN_DOM: "Date de fin de la domiciliation (ex: 12/10/2020)",
  DATE_PREMIERE_DOM: "Date de la 1ere domiciliation (ex: 12/10/2020)",
  DATE_DERNIER_PASSAGE: "Date de dernier passage (ex: 01/09/2020 à 10h45)",

  // ENTRETIEN
  ENTRETIEN_ORIENTE_PAR: "Orienté par xxxx",
  ENTRETIEN_DOMICILIATION_EXISTANTE: "Oui / Non",
  ENTRETIEN_REVENUS: "Oui ou non",
  ENTRETIEN_LIEN_COMMUNE: "Lien avec la commune",
  ENTRETIEN_COMPOSITION_MENAGE: "Composition du ménage",
  ENTRETIEN_SITUATION_RESIDENTIELLE: "Situation résidentielle",
  ENTRETIEN_CAUSE_INSTABILITE: "Cause instabilité logement",
  ENTRETIEN_RAISON_DEMANDE: "Motif principal de la demande",
  ENTRETIEN_ACCOMPAGNEMENT: "Accompagnement social",
};
