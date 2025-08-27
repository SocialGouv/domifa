export function anonymizeFullName(person: {
  nom: string | null;
  prenom: string | null;
}): string {
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

export const anonymizeText = (text?: string | null): string => {
  if (!text || text.trim().length === 0) {
    return "";
  }

  const cleanText = text.trim();

  if (cleanText.length < 3) {
    return cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
  }

  if (cleanText.length === 3) {
    const firstChar = cleanText.charAt(0).toUpperCase();
    const lastChar = cleanText.slice(-1).toUpperCase();
    return firstChar + "*" + lastChar;
  }

  const firstTwo = cleanText.slice(0, 2);
  const lastChar = cleanText.slice(-1);
  const capitalizedFirstTwo =
    firstTwo.charAt(0).toUpperCase() + firstTwo.charAt(1).toLowerCase();
  const capitalizedLastChar = lastChar.toUpperCase();

  const starsCount = cleanText.length - 3;
  const stars = "*".repeat(starsCount);

  return capitalizedFirstTwo + stars + capitalizedLastChar;
};
