// Emails tagged with the "deleted-" prefix correspond to structures/users that
// have been administratively deleted (see the prefix-deleted-emails migration).
// Such addresses must NEVER be created or synced into Brevo, nor receive any
// transactional email: the contact has already been removed from the lists
// during deletion, and re-sending would re-attach a real recipient to a stale
// "deleted-" identity. Read/delete operations stay allowed so cleanup paths
// remain idempotent.
export function isDeletedEmail(email: string | null | undefined): boolean {
  return (
    typeof email === "string" && email.toLowerCase().startsWith("deleted-")
  );
}
