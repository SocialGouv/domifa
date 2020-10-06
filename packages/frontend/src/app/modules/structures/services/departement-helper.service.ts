import { Injectable } from "@angular/core";
import { DEPARTEMENTS_MAP } from "src/app/shared/DEPARTEMENTS_MAP.const";

// NOTE: service dupliqué côté backend
const EXCEPTIONS_CODE_POSTAL: { [codePostal: string]: string } = {
  "42620": "03", // https://fr.wikipedia.org/wiki/Liste_des_communes_de_France_dont_le_code_postal_ne_correspond_pas_au_d%C3%A9partement
  "05110": "04",
  "05130": "04",
  "05160": "04",
  "06260": "04",
  "48250": "07",
  "43450": "15",
  "36260": "18",
  "18120": "18",
  "33220": "24",
  "05700": "26",
  "73670": "38",
  "01410": "39",
  "39310": "39",
  "01590": "39",
  "52100": "51",
  "21340": "71",
  "01200": "74",
  "13780": "83",
  "37160": "86",
  "94390": "91",
  "97150": "978", // https://fr.wikipedia.org/wiki/Saint-Martin_(Antilles_fran%C3%A7aises)
  "97133": "977", // https://fr.wikipedia.org/wiki/Saint-Barth%C3%A9lemy_(Antilles_fran%C3%A7aises)
};

@Injectable({
  providedIn: "root",
})
export class DepartementHelper {
  public getRegionCodeFromDepartement(departement: string): string {
    if (!departement) {
      throw new Error("Department not set");
    }
    const region = DEPARTEMENTS_MAP[departement.toUpperCase()];

    if (region) {
      return region.regionCode;
    } else {
      const errorMessage = `Invalid departement ${departement} (no region found)`;
      // tslint:disable-next-line: no-console
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  public getDepartementFromCodePostal(codePostal: string): string {
    if (codePostal.length !== 5) {
      const errorMessage = `Invalid postal code ${codePostal} (cause: ${codePostal.length} characters)`;
      // tslint:disable-next-line: no-console
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    if (EXCEPTIONS_CODE_POSTAL[codePostal]) {
      // certaines communes n'ont pas un code postal correspondant à leur département
      return EXCEPTIONS_CODE_POSTAL[codePostal];
    }
    if (codePostal.startsWith("20")) {
      // corse https://fr.wikipedia.org/wiki/Code_postal_en_France#Corse_(20)
      if (codePostal.startsWith("200") || codePostal.startsWith("201")) {
        // Corse du Sud
        return "2A";
      }
      if (codePostal.startsWith("202") || codePostal.startsWith("206")) {
        // Haute Corse
        return "2B";
      }
      const errorMessage = `Invalid postal code ${codePostal} for "Corse"`;
      // tslint:disable-next-line: no-console
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    // outre-mer: https://fr.wikipedia.org/wiki/Code_postal_en_France#France_d'outre-mer
    if (codePostal.startsWith("97")) {
      // note: les exceptions "Saint-Barthélemy" et "Saint-Martin" sont gérés via la constante EXCEPTIONS_CODE_POSTAL plus haut
      return codePostal.substring(0, 3);
    }

    // cas général
    return codePostal.substring(0, 2);
  }
}
