import { UsagersFilterCriteria } from "../UsagersFilterCriteria";
import { format, isValid, parseISO } from "date-fns";
import { UsagerLight } from "../../../../../../_common/model";
import { UsagerProcuration } from "../../../../usager-shared/interfaces/UsagerProcuration.interface";
import { UsagerAyantDroit } from "@domifa/common";

const validateBirthDate = (date?: Date | string): string | undefined => {
  if (!date) return undefined;
  const parsedDate = typeof date === "string" ? parseISO(date) : date;
  return !isValid(parsedDate) ? undefined : format(parsedDate, "dd/MM/yyyy");
};

export const getAttributes = (
  usager: UsagerLight,
  {
    searchStringField,
  }: Pick<UsagersFilterCriteria, "searchString" | "searchStringField">
) => {
  let attributes = [];
  if (searchStringField === "DATE_NAISSANCE") {
    const attributes: string[] = [];

    if (usager.dateNaissance) {
      const formattedDate = validateBirthDate(usager.dateNaissance);
      if (formattedDate) attributes.push(formattedDate);
    }

    usager.ayantsDroits.forEach((ad) => {
      const formattedDate = validateBirthDate(ad.dateNaissance);
      if (formattedDate) attributes.push(formattedDate);
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
