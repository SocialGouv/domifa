/* TYPE DE STRUCTURE */
export const structureType = {
  asso: "Organisme agrée",
  ccas: "CCAS",
  cias: "CIAS",
};

/* LIENS DE PARENTÉ */
export const LIENS_PARENTE: { [key: string]: string } = {
  AUTRE: "Autre personne à la charge du domicilié",
  CONJOINT: "Conjoint.e",
  ENFANT: "Enfant",
  PARENT: "Parent",
};

/* DÉCISIONS */
export const DECISION_LABELS: { [key: string]: string } = {
  ATTENTE_DECISION: "Demande de domiciliation déposée",
  INSTRUCTION: "Instruction du dossier",
  RADIE: "Radiation",
  REFUS: "Demande refusée",
  VALIDE: "Domiciliation acceptée",
};

/* DÉCISIONS */
export const DECISION_STATUT_LABELS: { [key: string]: string } = {
  TOUS: "Tous",
  ATTENTE_DECISION: "Attente de décision",
  INSTRUCTION: "À compléter",
  RADIE: "Radiés",
  REFUS: "Refusés",
  VALIDE: "Actifs",
};

/* QUESTIONS RÉPONSES DE L'ENTRETIEN SOCIAL */
export const residence = {
  DOMICILE_MOBILE: "Domicile mobile (ex: caravane)",
  HEBERGEMENT_SOCIAL: "Hébergement social (sans service courrier)",
  HEBERGEMENT_TIERS: "Hébergé chez un tiers",
  HOTEL: "Hôtel",
  SANS_ABRI: "Sans abris / Squat",
};

export const typeMenage = {
  COUPLE_AVEC_ENFANT: "Couple avec enfant(s)",
  COUPLE_SANS_ENFANT: "Couple sans enfant",
  FEMME_ISOLE_AVEC_ENFANT: "Femme isolée avec enfant(s)",
  FEMME_ISOLE_SANS_ENFANT: "Femme isolée sans enfant",
  HOMME_ISOLE_AVEC_ENFANT: "Homme isolé avec enfant(s)",
  HOMME_ISOLE_SANS_ENFANT: "Homme isolé sans enfant",
};

export const cause = {
  ERRANCE: "Errance",
  EXPULSION: "Expulsion",
  HEBERGE_SANS_ADRESSE: "Hébergé, mais ne peut justifier d'une adresse",
  ITINERANT: "Personnes itinérantes",
  RUPTURE: "Rupture familiale et/ou conjugale ",
  SORTIE_STRUCTURE: "Sortie d'une structure d'hébergement",
  VIOLENCE: "Violence familiale et/ou conjugale",
};

export const raison = {
  EXERCICE_DROITS: "Exercice des droits civils ou civiques",
  PRESTATIONS_SOCIALES: "Accès aux prestations sociales",
};
