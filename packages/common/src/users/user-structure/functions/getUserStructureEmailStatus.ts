import { UserStructureEmailStatus } from "../types";

// Prefixes that, when starting the local part, mark a functional mailbox.
const GENERIC_PREFIXES = [
  "admin",
  "postmaster",
  "webmaster",
  "root",
  "support",
  "helpdesk",
  "contact",
  "info",
  "infos",
  "sales",
  "commercial",
  "marketing",
  "pub",
  "service",
  "services",
  "noreply",
  "no-reply",
  "no.reply",
  "notification",
  "facturation",
  "billing",
  "compta",
  "comptabilite",
  "legal",
  "juridique",
  "domiciliation",
  "domiciliations",
  "siege",
  "accueil",
  "reception",
  "secretariat",
  "direction",
  "rh",
  "ressourceshumaines",
  "communication",
  "courrier",
  "coordination",
  "mairie",
  "ccas",
  "cias",
  "mds",
  "pmi",
  "mdph",
  "cae",
  "accompagnement",
  "hebergement",
  "logement",
  "insertion",
  "social",
  "action",
  "instruction",
  "informatique",
  "siao",
  "ts",
  "administration",
  "chrs",
  "travailleursocial",
];

// Words that, glued right after a generic prefix, keep the address generic
// (e.g. "accueildejour", "servicesocial", "domiciliationurgence").
const COMPOUND_GENERIC_RX =
  /^(de|du|des|le|la|les|et|en|sur|pour|par|au|aux|jour|nuit|social|soir|matin|urgence|famille|public|maison|ville|paris|lyon|france|centre)[a-z0-9]*$/i;

// Personal name patterns: "prenom.nom", "p.nom", "jdupont" (5-15 letters).
const PERSONAL_PATTERNS: RegExp[] = [
  /^[a-z]+([.\-_][a-z]+)+@/,
  /^[a-z]{2,}\.[a-z]@/,
  /^[a-z]{5,15}@/,
];

function isGenericLocal(local: string): boolean {
  for (const prefix of GENERIC_PREFIXES) {
    if (
      local === prefix ||
      local.startsWith(`${prefix}.`) ||
      local.startsWith(`${prefix}-`) ||
      local.startsWith(`${prefix}_`)
    ) {
      return true;
    }
    if (local.startsWith(prefix) && local.length > prefix.length) {
      const rest = local.slice(prefix.length);
      if (/^[0-9]+$/.test(rest) || /^[.\-_]/.test(rest)) {
        return true;
      }
      if (COMPOUND_GENERIC_RX.test(rest)) {
        return true;
      }
    }
  }
  return false;
}

function isPersonalLocal(local: string): boolean {
  const localAt = `${local}@`;
  return PERSONAL_PATTERNS.some((rx) => rx.test(localAt));
}

export function getUserStructureEmailStatus(
  email: string | null | undefined
): UserStructureEmailStatus {
  if (!email) {
    return "GENERIC_SUSPECTED";
  }
  const lower = email.trim().toLowerCase();
  const atIndex = lower.indexOf("@");
  if (atIndex <= 0 || atIndex === lower.length - 1) {
    return "GENERIC_SUSPECTED";
  }
  const local = lower.slice(0, atIndex);

  if (isGenericLocal(local)) {
    return "GENERIC_CONFIRMED";
  }
  if (isPersonalLocal(local)) {
    return "PERSONAL";
  }
  return "GENERIC_SUSPECTED";
}
