export const BREVO_EMAIL_EVENT_TYPES = [
  "bounces",
  "hardBounces",
  "softBounces",
  "delivered",
  "spam",
  "requests",
  "opened",
  "clicks",
  "invalid",
  "deferred",
  "blocked",
  "unsubscribed",
  "error",
  "loadedByProxy",
] as const;

export type BrevoEmailEventType = (typeof BREVO_EMAIL_EVENT_TYPES)[number];

export const BREVO_EMAIL_EVENT_LABELS: Record<BrevoEmailEventType, string> = {
  bounces: "Rebond",
  hardBounces: "Rebond définitif",
  softBounces: "Rebond temporaire",
  delivered: "Délivré",
  spam: "Spam",
  requests: "Envoyé",
  opened: "Ouvert",
  clicks: "Cliqué",
  invalid: "Invalide",
  deferred: "Différé",
  blocked: "Bloqué",
  unsubscribed: "Désabonné",
  error: "Erreur",
  loadedByProxy: "Chargé via proxy",
};

export type BrevoEmailEvent = {
  email: string;
  date: string;
  event: BrevoEmailEventType;
  messageId: string;
  subject?: string;
  reason?: string;
  tag?: string;
  ip?: string;
  link?: string;
  from?: string;
  templateId?: number;
};
