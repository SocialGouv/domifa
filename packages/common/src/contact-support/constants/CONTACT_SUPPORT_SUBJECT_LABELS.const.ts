import { type ContactSupportSubject } from "../types";

// Single source of truth for the contact form "subject" dropdown: shared
// between the frontend (select options) and the backend (input whitelist).
export const CONTACT_SUPPORT_SUBJECT_LABELS: {
  [key in ContactSupportSubject]: string;
} = {
  INSCRIPTION_SUPPRESSION_STRUCTURE:
    "Je souhaite inscrire ou supprimer ma structure",
  FORMATION: "Je souhaite suivre une formation",
  PROPOSITION_EVOLUTION: "Je souhaite soumettre des propositions d'évolutions",
  STATISTIQUES_RAPPORT_ACTIVITE:
    "J'ai une question sur les statistiques / le rapport d'activité",
  QUESTION_JURIDIQUE_SECURITE: "J'ai une question juridique / sécurité",
  QUESTION_MON_DOMIFA: "J'ai une question sur le portail domicilié Mon DomiFa",
  ASSISTANCE_TECHNIQUE:
    "J'ai besoin d'une assistance technique (imports de données, bug, modifications de comptes, explication d'une fonctionnalité)",
  PROBLEME_ACCESSIBILITE: "Je souhaite signaler un problème d'accessibilité",
  AUTRE: "Autre demande",
};

export const CONTACT_SUPPORT_SUBJECTS: ContactSupportSubject[] = Object.keys(
  CONTACT_SUPPORT_SUBJECT_LABELS
) as ContactSupportSubject[];
