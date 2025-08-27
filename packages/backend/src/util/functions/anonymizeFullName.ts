import { Usager } from "@domifa/common";

export function anonymizeFullName(
  person: { nom?: string | null; prenom?: string | null }
): string {
  const anonymizeText = (text?: string | null): string => {
    if (!text || text.trim().length === 0) {
      return "";
    }

    const cleanText = text.trim();

    if (cleanText.length <= 2) {
      return (
        cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase()
      );
    }

    const firstTwo = cleanText.slice(0, 2);
    const capitalizedFirstTwo =
      firstTwo.charAt(0).toUpperCase() + firstTwo.charAt(1).toLowerCase();
    const stars = "*".repeat(cleanText.length - 2);
    return capitalizedFirstTwo + stars;
  };

  const anonymizedPrenom = anonymizeText(person.prenom);
  const anonymizedNom = anonymizeText(person.nom);

  if (!anonymizedPrenom && !anonymizedNom) {
    return "";
  }

  if (!anonymizedPrenom) {
    return anonymizedNom;
  }

  if (!anonymizedNom) {
    return anonymizedPrenom;
  }

  return `${anonymizedPrenom} ${anonymizedNom}`;
}
