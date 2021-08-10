import { UsagerEntretienResidence } from "./../entretien/UsagerEntretienResidence.type";
import {
  UsagerEntretienCause,
  UsagerEntretienRaisonDemande,
  UsagerEntretienTypeMenage,
} from "../entretien";

export const ENTRETIEN_LIEN_COMMUNE = {
  RESIDENTIEL: "Résidentiel",
  PARENTAL: "Parental",
  FAMILIAL: "Familial",
  PROFESSIONNEL: "Professionnel",
  SOCIAL: "Social",
  AUTRE: "Autre",
};

export const ENTRETIEN_CAUSE: {
  [key in UsagerEntretienCause];
} = {
  AUTRE: "Autre cause",
  ERRANCE: "Errance",
  EXPULSION: "Expulsion",
  HEBERGE_SANS_ADRESSE: "Hébergé, mais ne peut justifier d'une adresse",
  ITINERANT: "Personnes itinérantes",
  RUPTURE: "Rupture familiale et/ou conjugale ",
  SORTIE_STRUCTURE: "Sortie d'une structure d'hébergement",
  VIOLENCE: "Violence familiale et/ou conjugale",
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

export const ENTRETIEN_RAISON_DEMANDE: {
  [key in UsagerEntretienRaisonDemande];
} = {
  AUTRE: "Autre raison",
  EXERCICE_DROITS: "Exercice des droits civils ou civiques",
  PRESTATIONS_SOCIALES: "Accès aux prestations sociales",
};

export const ENTRETIEN_RESIDENCE: {
  [key in UsagerEntretienResidence];
} = {
  AUTRE: "Autre résidence",
  DOMICILE_MOBILE: "Domicile mobile (ex: caravane)",
  HEBERGEMENT_SOCIAL: "Hébergement social (sans service courrier)",
  HEBERGEMENT_TIERS: "Hébergé chez un tiers",
  HOTEL: "Hôtel",
  SANS_ABRI: "Sans abris / Squat",
};
