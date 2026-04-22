import luhn from "luhn";

export function cleanSiret(siret: string | null | undefined): string | null {
  if (!siret || typeof siret !== "string") {
    return null;
  }
  const cleaned = siret.replace(/\D/g, "");
  return cleaned.length > 0 ? cleaned : null;
}

export function isSIRET(siret: string): boolean {
  const cleaned = cleanSiret(siret);
  if (!cleaned) {
    return false;
  }
  return /^\d{14}$/.test(cleaned) && luhn.validate(cleaned);
}
