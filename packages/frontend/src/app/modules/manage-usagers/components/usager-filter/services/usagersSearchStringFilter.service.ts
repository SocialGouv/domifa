import { UsagersFilterCriteria } from "../UsagersFilterCriteria";
import { format } from "date-fns";
import { UsagerLight } from "../../../../../../_common/model";
import { UsagerProcuration } from "../../../../usager-shared/interfaces/UsagerProcuration.interface";
import { UsagerAyantDroit } from "@domifa/common";

export const getAttributes = (
  usager: UsagerLight,
  {
    searchStringField,
  }: Pick<UsagersFilterCriteria, "searchString" | "searchStringField">
) => {
  let attributes = [];
  if (searchStringField === "DATE_NAISSANCE") {
    const dateNaissance =
      typeof usager.dateNaissance === "string"
        ? new Date(usager.dateNaissance)
        : null;

    attributes = dateNaissance ? [format(dateNaissance, "dd/MM/yyyy")] : [];

    usager.ayantsDroits.forEach((ad: UsagerAyantDroit) => {
      const dateNaissanceAd =
        typeof ad.dateNaissance === "string"
          ? new Date(ad.dateNaissance)
          : null;
      if (dateNaissanceAd) {
        attributes.push(format(dateNaissanceAd, "dd/MM/yyyy"));
      }
    });

    return attributes;
  }

  attributes = [usager.nom, usager.prenom, usager.surnom, usager.customRef];

  usager.options.procurations.forEach((procu: UsagerProcuration) => {
    attributes.push(procu.nom);
    attributes.push(procu.prenom);
  });

  usager.ayantsDroits.forEach((ad: UsagerAyantDroit) => {
    attributes.push(ad.nom);
    attributes.push(ad.prenom);
  });

  return attributes;
};
