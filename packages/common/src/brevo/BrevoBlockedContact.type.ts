// One entry of Brevo's transactional blocklist (hard bounces, spam complaints,
// manual ops blocks, unsubscribes from transactional emails). Mirrors the
// `getTransacBlockedContacts` response shape we expose to the admin UI.
export type BrevoBlockedContactReasonCode =
  | "unsubscribedViaMA"
  | "unsubscribedViaEmail"
  | "adminBlocked"
  | "unsubscribedViaApi"
  | "hardBounce"
  | "contactFlaggedAsSpam";

export type BrevoBlockedContact = {
  email: string;
  senderEmail: string | null;
  reasonCode: BrevoBlockedContactReasonCode | null;
  reasonMessage: string | null;
  blockedAt: string | null;
};

export const BREVO_BLOCKED_CONTACT_REASON_LABELS: Record<
  BrevoBlockedContactReasonCode,
  string
> = {
  unsubscribedViaMA: "Désinscription (automation marketing)",
  unsubscribedViaEmail: "Désinscription (lien dans l'email)",
  adminBlocked: "Blocage manuel admin",
  unsubscribedViaApi: "Désinscription via API",
  hardBounce: "Rebond définitif (hard bounce)",
  contactFlaggedAsSpam: "Plainte spam",
};
