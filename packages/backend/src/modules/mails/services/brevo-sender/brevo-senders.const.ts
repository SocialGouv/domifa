export const BREVO_SENDERS = {
  "fabrique.social.gouv.fr": {
    email: "contact.domifa@fabrique.social.gouv.fr",
    name: "DomiFa",
  },
  "mail.domifa.fabrique.social.gouv.fr": {
    email: "ne-pas-repondre@mail.domifa.fabrique.social.gouv.fr",
    name: "L'équipe DomiFa",
  },
} as const;

export type BrevoSenderDomain = keyof typeof BREVO_SENDERS;

export const DEFAULT_BREVO_SENDER_DOMAIN: BrevoSenderDomain =
  "fabrique.social.gouv.fr";

export const BREVO_REPLY_TO = {
  email: "contact.domifa@fabrique.social.gouv.fr",
  name: "DomiFa",
};

export const isBrevoSenderDomain = (
  value: string | null | undefined
): value is BrevoSenderDomain => !!value && value in BREVO_SENDERS;
