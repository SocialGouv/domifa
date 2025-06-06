import { StructureCustomDocKeys } from "../types";

export const CUSTOM_DOCS_LABELS: {
  [key in StructureCustomDocKeys]: string;
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

  STRUCTURE_VILLE: "Ville de la structure",
  STRUCTURE_CODE_POSTAL: "Code postal de la structure",
  STRUCTURE_TELEPHONE: "Téléphone de la structure",

  // Si courrier différent
  STRUCTURE_COURRIER_ADRESSE: "Adresse de réception du courrier",
  STRUCTURE_COMPLEMENT_ADRESSE: "Complément de l'adresse de la structure",
  STRUCTURE_AGREMENT: "Numéro d’agrément",
  STRUCTURE_PREFECTURE: "Préfecture ayant délivré l’agrément",

  STRUCTURE_COURRIER_VILLE: "Ville de réception courrier",
  STRUCTURE_COURRIER_CODE_POSTAL: "Code postal de réception courrier",
  STRUCTURE_ADRESSE_EMAIL: "Email de la structure",
  // USAGER INFOS
  USAGER_REF: "Référence dossier",
  USAGER_CUSTOM_REF: "Identifiant personnalisé",
  USAGER_NUMERO_DISTRIBUTION_SPECIALE: "Numéro de distribution (TSA, BP, etc)",
  USAGER_CIVILITE: "Civilité",
  USAGER_NOM: "Nom",
  USAGER_PRENOM: "Prénom",
  USAGER_SURNOM: "Nom d'usage / Surnom",
  USAGER_LANGUE: "Langue parlée",
  USAGER_NATIONALITE: "Nationalité",
  USAGER_DATE_NAISSANCE: "Date naissance",
  USAGER_LIEU_NAISSANCE: "Lieu naissance",
  REFERENT: "Référent du dossier",
  AYANTS_DROITS_NOMBRE: "Nombre d'ayants droit",
  AYANTS_DROITS_LISTE:
    "La liste des ayants droit avec nom prénom et date de naissance",

  // CONTACT USAGER
  USAGER_PHONE: "Numéro de téléphone",
  USAGER_EMAIL: "Adresse email",

  // STATUT ET TYPE DE DOM
  STATUT_DOM: "Statut de la domiciliation",
  TYPE_DOM: "Type de domiciliation",

  // REFUS / RADIATION
  MOTIF_REFUS: "Motif du refus",
  MOTIF_RADIATION: "Motif de la radiation",
  DATE_RADIATION: "Date de la radiation",
  DATE_RADIATION_FORMAT_COURT: "Date de la radiation au format (dd/mm/yyyy)",
  DATE_REFUS: "Date du refus",
  DATE_REFUS_FORMAT_COURT: "Date du refus au format (dd/mm/yyyy)",
  DECISION_NOM_AGENT: "Utilisateur ayant prit la décision",
  PREMIERE_DOM_NOM_AGENT: "Utilisateur ayant validé la 1ere dom",

  // DATES DOMICILIATION
  DATE_DEBUT_DOM: "Date de Début de la domiciliation: 12 octobre 2020",
  DATE_DEBUT_DOM_FORMAT_COURT:
    "Date de Début de la domiciliation (ex: 12/10/2020)",
  DATE_FIN_DOM: "Date de fin de la domiciliation: 12 octobre 2020",
  DATE_FIN_DOM_FORMAT_COURT: "Date de fin de la domiciliation (ex: 12/10/2020)",
  DATE_PREMIERE_DOM: "Date de la 1ere domiciliation: 12 octobre 2020",
  DATE_PREMIERE_DOM_FORMAT_COURT:
    "Date de la 1ere domiciliation (ex: 12/10/2020)",
  DATE_DERNIER_PASSAGE: "Date de dernier passage (ex: 01/09/2020 à 10h45)",

  // ENTRETIEN
  ENTRETIEN_ORIENTATION: "Orientation: oui ou non",
  ENTRETIEN_ORIENTATION_DETAIL: "Orienté par xxxx",
  ENTRETIEN_DOMICILIATION_EXISTANTE: "Domiciliation existante : Oui / Non",
  ENTRETIEN_REVENUS: "Revenus : Oui / Non",
  ENTRETIEN_REVENUS_DETAIL: "Détail des revenus",
  ENTRETIEN_LIEN_COMMUNE: "Lien avec la commune",
  ENTRETIEN_COMPOSITION_MENAGE: "Composition du ménage",
  ENTRETIEN_SITUATION_RESIDENTIELLE: "Situation résidentielle",
  ENTRETIEN_CAUSE_INSTABILITE: "Cause instabilité logement",
  ENTRETIEN_RAISON_DEMANDE: "Motif principal de la demande",
  ENTRETIEN_RATTACHEMENT: "Rattachement à une ville ou un arrondissement",
  ENTRETIEN_ACCOMPAGNEMENT: "Accompagnement social: oui ou non",
  ENTRETIEN_ACCOMPAGNEMENT_DETAIL: "Détail de l'accompagnement social",
  ENTRETIEN_SITUATION_PROFESSIONNELLE: "Situation professionnelle",
  ENTRETIEN_COMMENTAIRE: "Commentaire de l'entretien",
  // Transferts
  TRANSFERT_ACTIF: "Transfert actif ou non : (oui / non)",
  TRANSFERT_NOM: "Nom de l'établissement",
  TRANSFERT_ADRESSE: "Adresse de l'établissement",
  TRANSFERT_DATE_DEBUT: "Date de début de validité (jj/mm/aaaa)",
  TRANSFERT_DATE_FIN: "Date de fin de validité (jj/mm/aaaa)",
  // Procuration
  PROCURATION_ACTIF: "Procuration active ou non : (oui / non)",
  PROCURATION_NOM: "Nom du mandataire",
  PROCURATION_PRENOM: "Prénom du mandataire",
  PROCURATION_DATE_DEBUT: "Date de début de validité (jj/mm/aaaa)",
  PROCURATION_DATE_FIN: "Date de fin de validité (jj/mm/aaaa)",
  PROCURATION_DATE_NAISSANCE: "Date de naissance (jj/mm/aaaa)",
  PROCURATIONS_LISTE: "Liste des procurations",
  PROCURATIONS_NOMBRE: "Nombre de procurations",

  // Espace domicilié
  ESPACE_DOM_URL: "Url de l'espace domicilié",
  ESPACE_DOM_ID: "Identifiant",
  ESPACE_DOM_MDP: "Mot de passe de l'espace domicilié",
  MON_DOMIFA_ACTIVATION: "Portail Mon DomiFa activé ?",
  SMS_ACTIVATION: "SMS activés ?",
};
