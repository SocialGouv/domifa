/* TYPE DE STRUCTURE */
export const structureType = {
  asso: "Organisme agrée",
  ccas: "CCAS / CIAS",
};

/* LIENS DE PARENTÉ */
export const lienParente: { [key: string]: any } = {
  AUTRE: "Autre personne à la charge du domicilié",
  CONJOINT: "Conjoint.e",
  ENFANT: "Enfant",
  PARENT: "Parent",
};

/* DÉCISIONS */
export const decision: { [key: string]: any } = {
  ATTENTE_DECISION: "Demande de domiciliation déposée",
  IMPORT: "Dossier importé",
  INSTRUCTION: "Instruction du dossier",
  PREMIERE: "Première domiciliation",
  PREMIERE_DOM: "Première domiciliation",
  RADIE: "Radiation",
  REFUS: "Demande refusée",
  VALIDE: "Domiciliation acceptée",
};

/* DÉCISIONS */
export const decisionStats: { [key: string]: any } = {
  ATTENTE_DECISION: "Demandes déposées",
  INSTRUCTION: "Dossiers cours",
  RADIE: "Eadiés",
  REFUS: "Demandes refusées",
  VALIDE: "Domiciliés actifs",
};

/* MOTIFS DE RADIATION ET REFUS */
export const motifsRadiation: { [key: string]: any } = {
  A_SA_DEMANDE: "À la demande de la personne",
  ENTREE_LOGEMENT: "Plus de lien avec la commune",
  FIN_DE_DOMICILIATION:
    "La domiciliation est arrivée à échéance (1 an) et son renouvellement n'a pas été sollicité",
  NON_MANIFESTATION_3_MOIS:
    "Non manifestation de la personne pendant plus de 3 mois consécutifs",
  NON_RESPECT_REGLEMENT: "Non-respect du règlement",
  PLUS_DE_LIEN_COMMUNE: "Entrée dans un logement/hébergement stable",
};

export const motifsRefus: { [key: string]: any } = {
  HORS_AGREMENT: "En dehors des critères du public domicilié",
  LIEN_COMMUNE: "Absence de lien avec la commune",
  SATURATION: "Nombre maximal de domiciliations atteint",
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
  MINEUR: "Mineur",
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
