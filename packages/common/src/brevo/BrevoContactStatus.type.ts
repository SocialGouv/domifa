// Snapshot of a Brevo contact's current state, returned by the admin endpoint
// used to drive the "Suivi Brevo" tab (status banner + unblock button).
export type BrevoContactStatus = {
  existsInBrevo: boolean;
  emailBlacklisted: boolean;
  smsBlacklisted?: boolean;
  listIds?: number[];
  createdAt?: string;
  modifiedAt?: string;
  // Brevo internal contact id, used to deep-link to the contact page in the
  // Brevo back-office (https://app.brevo.com/contact/index/<id>).
  id?: number;
};
