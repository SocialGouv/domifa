import { isNil } from "lodash";
import { Usager } from "@domifa/common";
import { UserStructureAuthenticated } from "../../../_common/model";
import { getUsagerRef } from "./get-usager-ref";

export function getAddress(
  user: UserStructureAuthenticated,
  usager: Usager
): {
  adresseStructure: string;
  adresseDomicilie: string;
} {
  // Adresse de la structure
  let adresseDomicilie = "";

  const numeroDistribution = !isNil(usager.numeroDistribution)
    ? `\n${usager.numeroDistribution}\n`
    : "\n";

  if (
    !isNil(user.structure.adresseCourrier) &&
    user.structure.adresseCourrier.actif
  ) {
    adresseDomicilie = `${user.structure.nom}\n${user.structure.adresseCourrier.adresse}`;
    adresseDomicilie += `${numeroDistribution}${user.structure.adresseCourrier.codePostal} - ${user.structure.adresseCourrier.ville}`;
  } else {
    adresseDomicilie = `${user.structure.nom}\n${user.structure.adresse}`;

    // Complément d'adresse
    if (!isNil(user.structure.complementAdresse)) {
      adresseDomicilie += `\n${user.structure.complementAdresse}`;
    }
    // Numéro de distribution spéciale
    adresseDomicilie += `${numeroDistribution}${user.structure.codePostal} - ${user.structure.ville}`;
  }

  const adresseStructure = `${user.structure.adresse}\n${user.structure.codePostal} - ${user.structure.ville}`;

  // Numéro de boite au lettre
  if (user.structure.options?.numeroBoite) {
    adresseDomicilie = `Boite ${getUsagerRef(usager)}\n${adresseDomicilie}`;
  }

  return { adresseStructure, adresseDomicilie };
}
