import { type UsagerEntretienResidence } from "../types/entretien/UsagerEntretienResidence.type";
import {
  type UsagerEntretienSituationPro,
  type UsagerEntretienCause,
  type UsagerEntretienLienCommune,
  type UsagerEntretienRaisonDemande,
  type UsagerEntretienTypeMenage,
} from "../types/entretien";

export const ENTRETIEN_LIEN_COMMUNE: {
  [key in UsagerEntretienLienCommune]: string;
} = {
  RESIDENTIEL: "Résidentiel",
  PARENTAL: "Parental",
  FAMILIAL: "Familial",
  PROFESSIONNEL: "Professionnel",
  SOCIAL: "Social",
  AUTRE: "Autre",
};

export const ENTRETIEN_CAUSE_INSTABILITE: {
  [key in UsagerEntretienCause]: string;
} = {
  AUTRE: "Autre cause",
  ERRANCE: "Errance",
  EXPULSION: "Expulsion",
  HEBERGE_SANS_ADRESSE: "Hébergé, mais ne peut justifier d'une adresse",
  ITINERANT: "Personnes itinérantes",
  RUPTURE: "Rupture familiale et/ou conjugale ",
  SORTIE_STRUCTURE: "Sortie d'une structure d'hébergement",
  VIOLENCE: "Violence familiale et/ou conjugale",
  SORTIE_HOSPITALISATION: "Sortie d'hospitalisation",
  SORTIE_INCARCERATION: "Sortie d'incarcération",
};

export const ENTRETIEN_TYPE_MENAGE: {
  [key in UsagerEntretienTypeMenage]: string;
} = {
  COUPLE_AVEC_ENFANT: "Couple avec enfant(s)",
  COUPLE_SANS_ENFANT: "Couple sans enfant",
  FEMME_ISOLE_AVEC_ENFANT: "Femme isolée avec enfant(s)",
  FEMME_ISOLE_SANS_ENFANT: "Femme isolée sans enfant",
  HOMME_ISOLE_AVEC_ENFANT: "Homme isolé avec enfant(s)",
  HOMME_ISOLE_SANS_ENFANT: "Homme isolé sans enfant",
};

export const ENTRETIEN_SITUATION_PRO: {
  [key in UsagerEntretienSituationPro]: string;
} = {
  ETUDIANT: "Etudiant",
  SALARIE: "Salarié",
  INDEPENDANT: "Indépendant",
  FRANCE_TRAVAIL: "Inscrit à France Travail (ex Pôle-emploi)",
  RSA: "RSA",
  AAH: "Allocation aux adultes handicapés (AAH)",
  RETRAITE: "Retraité",
  AUTRE: "Autre raison",
};

export const ENTRETIEN_RAISON_DEMANDE: {
  [key in UsagerEntretienRaisonDemande]: string;
} = {
  AUTRE: "Autre raison",
  EXERCICE_DROITS: "Exercice des droits civils ou civiques",
  PRESTATIONS_SOCIALES: "Accès aux prestations sociales",
};

export const ENTRETIEN_RESIDENCE: {
  [key in UsagerEntretienResidence]: string;
} = {
  AUTRE: "Autre résidence",
  DOMICILE_MOBILE: "Domicile mobile (ex: caravane)",
  HEBERGEMENT_SOCIAL: "Hébergement social (sans service courrier)",
  HEBERGEMENT_TIERS: "Hébergé chez un tiers",
  HOTEL: "Hôtel",
  SANS_ABRI: "Sans abris / Squat",
};
