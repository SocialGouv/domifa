// Snapshot of a Brevo contact's current state, returned by the admin endpoint
// used to drive the "Suivi Brevo" tab (status banner + unblock button).
export type BrevoContactStatus = {
  existsInBrevo: boolean;
  emailBlacklisted: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  createdAt?: string;
  modifiedAt?: string;
};
