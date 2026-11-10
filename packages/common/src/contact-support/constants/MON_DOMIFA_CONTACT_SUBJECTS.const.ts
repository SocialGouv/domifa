import { type MonDomifaContactSubject } from "../types";

export interface MonDomifaContactSubjectDef {
  label: string;
  // Information displayed as soon as the subject is selected, before sending
  response: string | null;
  // true: a free-text message is required before sending
  requiresMessage: boolean;
}

// Contact form of the "Mon DomiFa" portal (domiciliés). Every subject is sent
// to the support team.
export const MON_DOMIFA_CONTACT_SUBJECTS_DEF: {
  [key in MonDomifaContactSubject]: MonDomifaContactSubjectDef;
} = {
  MOT_DE_PASSE_IDENTIFIANT: {
    label: "Je souhaite un nouveau mot de passe ou récupérer mon identifiant",
    response:
      "Seule votre structure de domiciliation peut réinitialiser votre mot de passe ou vous redonner votre identifiant. Pour une réponse plus rapide, nous vous invitons à la contacter directement.",
    requiresMessage: false,
  },
  COPIE_DOCUMENT: {
    label: "Je souhaite une copie de mon cerfa ou d'un autre document",
    response:
      "Votre structure de domiciliation est votre principal interlocuteur pour obtenir une copie de votre formulaire CERFA ou de tout autre document administratif. L'équipe DomiFa n'a pas accès à ces documents.",
    requiresMessage: false,
  },
  CREATION_RENOUVELLEMENT_CLOTURE: {
    label:
      "Je souhaite la création, le renouvellement ou la clôture de ma domiciliation",
    response:
      "Seule votre structure de domiciliation est habilitée à créer, renouveler ou clôturer votre domiciliation. Nous vous invitons à vous rapprocher directement d'elle.",
    requiresMessage: false,
  },
  MODIFIER_COORDONNEES: {
    label: "Je souhaite modifier mes coordonnées téléphone / email",
    response:
      "La mise à jour de vos coordonnées de contact est réalisée par votre structure de domiciliation. Nous vous invitons à vous rapprocher directement d'elle.",
    requiresMessage: false,
  },
  INFORMATION_COURRIER: {
    label: "Je souhaite une information concernant mon courrier",
    response:
      "Votre structure de domiciliation est la seule à pouvoir vous renseigner sur la réception, le suivi ou la mise à disposition de votre courrier. Nous vous invitons à vous rapprocher directement d'elle.",
    requiresMessage: false,
  },
  SUPPRESSION_DONNEES: {
    label:
      "Je souhaite demander la suppression de mes données sur le portail Mon DomiFa",
    response:
      "Après l'envoi de votre demande, nous vous répondrons par email afin de vous confirmer la suppression de vos accès et de vos données sur Mon DomiFa.",
    requiresMessage: false,
  },
  PROBLEME_ACCESSIBILITE: {
    label:
      "Je souhaite signaler un problème d'accessibilité (lié à un handicap)",
    response: null,
    requiresMessage: true,
  },
  AUTRE: {
    label: "J'ai une autre demande",
    response: null,
    requiresMessage: true,
  },
};

export const MON_DOMIFA_CONTACT_SUBJECTS = Object.keys(
  MON_DOMIFA_CONTACT_SUBJECTS_DEF
) as MonDomifaContactSubject[];
