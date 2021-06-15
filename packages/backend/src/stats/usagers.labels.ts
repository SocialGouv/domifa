/* TYPE DE STRUCTURE */
export const structureType: { [key: string]: string } = {
  asso: "Organisme agrée",
  ccas: "CCAS ",
  cias: "CIAS ou commune",
};

/* DÉCISIONS */
export const decisionStats: { [key: string]: string } = {
  TOUS: "Tous",
  ATTENTE_DECISION: "Demandes déposées",
  INSTRUCTION: "DOSSIERS EN cours",
  RADIE: "radiés",
  REFUS: "Demandes refusées",
  VALIDE: "DOMICILIÉS ACTIFS",
};

/* QUESTIONS RÉPONSES DE L'ENTRETIEN SOCIAL */
export const residence: { [key: string]: string } = {
  AUTRE: "Autre",
  DOMICILE_MOBILE: "Domicile mobile (ex: caravane)",
  HEBERGEMENT_SOCIAL: "Hébergement social (sans service courrier)",
  HEBERGEMENT_TIERS: "Hébergé chez un tiers",
  HOTEL: "Hôtel",
  SANS_ABRI: "Sans abris / Squat",
};

export const typeMenage: { [key: string]: string } = {
  COUPLE_AVEC_ENFANT: "Couple avec enfant(s)",
  COUPLE_SANS_ENFANT: "Couple sans enfant",
  FEMME_ISOLE_AVEC_ENFANT: "Femme isolée avec enfant(s)",
  FEMME_ISOLE_SANS_ENFANT: "Femme isolée sans enfant",
  HOMME_ISOLE_AVEC_ENFANT: "Homme isolé avec enfant(s)",
  HOMME_ISOLE_SANS_ENFANT: "Homme isolé sans enfant",
};

export const cause: { [key: string]: string } = {
  AUTRE: "Autre",
  ERRANCE: "Errance",
  EXPULSION: "Expulsion",
  HEBERGE_SANS_ADRESSE: "Hébergé, mais ne peut justifier d'une adresse",
  ITINERANT: "Personnes itinérantes",
  RUPTURE: "Rupture familiale et/ou conjugale ",
  SORTIE_STRUCTURE: "Sortie d'une structure d'hébergement",
  VIOLENCE: "Violence familiale et/ou conjugale",
};

export const raison: { [key: string]: string } = {
  AUTRE: "Autre",
  EXERCICE_DROITS: "Exercice des droits civils ou civiques",
  PRESTATIONS_SOCIALES: "Accès aux prestations sociales",
};
