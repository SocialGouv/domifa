import { DEPARTEMENTS_MAP, EXCEPTIONS_CODE_POSTAL } from "../constants";

export function getRegionCodeFromDepartement(departement: string): string {
  if (!departement) {
    throw new Error("Department not set");
  }
  const region = DEPARTEMENTS_MAP[departement.toUpperCase()];

  if (region) {
    return region.regionCode;
  } else {
    const errorMessage = `Invalid departement ${departement} (no region found)`;
    throw new Error(errorMessage);
  }
}

export function getDepartementFromCodePostal(codePostal: string): string {
  if (codePostal.length !== 5) {
    const errorMessage = `Invalid postal code ${codePostal} (cause: ${codePostal.length} characters)`;
    throw new Error(errorMessage);
  }
  if (EXCEPTIONS_CODE_POSTAL[codePostal]) {
    // certaines communes n'ont pas un code postal correspondant à leur département
    return EXCEPTIONS_CODE_POSTAL[codePostal];
  }

  if (codePostal.startsWith("20")) {
    // Corsica https://fr.wikipedia.org/wiki/Code_postal_en_France#Corse_(20)
    if (codePostal.startsWith("200") || codePostal.startsWith("201")) {
      // South Corsica
      return "2A";
    }

    if (codePostal.startsWith("202") || codePostal.startsWith("206")) {
      // North Corsica
      return "2B";
    }

    const errorMessage = `Invalid postal code ${codePostal} for Corsica in France`;
    throw new Error(errorMessage);
  }

  // outre-mer: https://fr.wikipedia.org/wiki/Code_postal_en_France#France_d'outre-mer
  if (codePostal.startsWith("97") || codePostal.startsWith("98")) {
    // note: les exceptions "Saint-Barthélemy" et "Saint-Martin" sont gérés via la constante EXCEPTIONS_CODE_POSTAL plus haut
    return codePostal.substring(0, 3);
  }

  // cas général
  return codePostal.substring(0, 2);
}
