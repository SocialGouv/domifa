import { anonymizeText } from "./anonymizeFullName";

// Masque la partie locale (garde 2 premiers caractères + dernier) et laisse
// le domaine visible, pour rester exploitable dans les logs de sécurité.
export function anonymizeEmail(email?: string | null): string {
  if (!email) {
    return "";
  }

  const atIndex = email.indexOf("@");
  if (atIndex === -1) {
    return anonymizeText(email);
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);
  return `${anonymizeText(localPart)}@${domain}`;
}
