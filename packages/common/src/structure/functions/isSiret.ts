import luhn from "luhn";

export function isSIRET(siret: string): boolean {
  if (!siret || typeof siret !== "string") {
    return false;
  }
  const cleanSiret = siret.replace(/\D/g, "");

  return /^\d{14}$/.test(cleanSiret) && luhn.validate(cleanSiret);
}
