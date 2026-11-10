import { type MonDomifaContactSubject } from "../types";

export interface MonDomifaContactSubjectDef {
  label: string;
  // Answer displayed as soon as the subject is selected
  response: string | null;
  // false: answered on screen only, no email is sent to the support team
  // (only an analytics event is tracked)
  sendToSupport: boolean;
  // true: a free-text message is required before sending
  requiresMessage: boolean;
}

// Contact form of the "Mon DomiFa" portal (domiciliés)
export const MON_DOMIFA_CONTACT_SUBJECTS_DEF: {
  [key in MonDomifaContactSubject]: MonDomifaContactSubjectDef;
} = {
  MOT_DE_PASSE_IDENTIFIANT: {
    label: "Je souhaite un nouveau mot de passe ou récupérer mon identifiant",
    response:
      "Pour toute réinitialisation de mot de passe, veuillez vous rapprocher de votre structure de domiciliation.",
    sendToSupport: false,
    requiresMessage: false,
  },
  COPIE_DOCUMENT: {
    label: "Je souhaite une copie de mon cerfa ou d'un autre document",
    response:
      "Pour obtenir une copie de votre formulaire CERFA ou de tout autre document administratif, votre structure de domiciliation reste votre principal interlocuteur.",
    sendToSupport: false,
    requiresMessage: false,
  },
  CREATION_RENOUVELLEMENT_CLOTURE: {
    label:
      "Je souhaite la création, le renouvellement ou la clôture de ma domiciliation",
    response:
      "Pour toute demande de création, de renouvellement ou de clôture de domiciliation, nous vous invitons à vous rapprocher directement de votre structure de domiciliation, qui est habilitée à effectuer cette démarche.",
    sendToSupport: false,
    requiresMessage: false,
  },
  MODIFIER_COORDONNEES: {
    label: "Je souhaite modifier mes coordonnées téléphone / email",
    response:
      "La mise à jour de vos coordonnées de contact doit être réalisée directement auprès de votre structure de domiciliation.",
    sendToSupport: false,
    requiresMessage: false,
  },
  INFORMATION_COURRIER: {
    label: "Je souhaite une information concernant mon courrier",
    response:
      "Pour toute question concernant la réception, le suivi ou la mise à disposition de votre courrier, nous vous invitons à vous rapprocher directement de votre structure de domiciliation, qui pourra vous renseigner et vous accompagner dans vos démarches.",
    sendToSupport: false,
    requiresMessage: false,
  },
  SUPPRESSION_DONNEES: {
    label:
      "Je souhaite demander la suppression de mes données sur le portail Mon DomiFa",
    response:
      "Si votre demande concerne la suppression de vos accès à Mon DomiFa, nous vous répondrons prochainement afin de vous confirmer la suppression de vos données.",
    sendToSupport: true,
    requiresMessage: false,
  },
  PROBLEME_ACCESSIBILITE: {
    label:
      "Je souhaite signaler un problème d'accessibilité (lié à un handicap)",
    response: null,
    sendToSupport: true,
    requiresMessage: true,
  },
  AUTRE: {
    label: "J'ai une autre demande",
    response: null,
    sendToSupport: true,
    requiresMessage: true,
  },
};

export const MON_DOMIFA_CONTACT_SUBJECTS = Object.keys(
  MON_DOMIFA_CONTACT_SUBJECTS_DEF
) as MonDomifaContactSubject[];

// Only these subjects can be submitted to the backend
export const MON_DOMIFA_CONTACT_SUBMITTABLE_SUBJECTS =
  MON_DOMIFA_CONTACT_SUBJECTS.filter(
    (subject) => MON_DOMIFA_CONTACT_SUBJECTS_DEF[subject].sendToSupport
  );
