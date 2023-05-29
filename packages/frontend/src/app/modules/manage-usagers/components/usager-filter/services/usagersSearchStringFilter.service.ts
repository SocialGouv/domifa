import { UsagersFilterCriteria } from "../UsagersFilterCriteria";
import { format } from "date-fns";
import { UsagerLight, UsagerAyantDroit } from "../../../../../../_common/model";
import { search } from "../../../../../shared";
import { UsagerProcuration } from "../../../../usager-shared/interfaces/UsagerProcuration.interface";

export const usagersSearchStringFilter = {
  filter,
};

function filter(
  usagers: UsagerLight[],
  {
    searchString,
    searchStringField,
    searchInAyantDroits,
    searchInProcurations,
  }: Pick<
    UsagersFilterCriteria,
    | "searchString"
    | "searchInAyantDroits"
    | "searchInProcurations"
    | "searchStringField"
  >
) {
  return search.filter(usagers, {
    searchText: searchString,
    getAttributes: (usager: UsagerLight) => {
      let attributes = [];
      if (searchStringField === "DATE_NAISSANCE") {
        const dateNaissance =
          typeof usager.dateNaissance === "string"
            ? new Date(usager.dateNaissance)
            : null;

        attributes = dateNaissance ? [format(dateNaissance, "dd/MM/yyyy")] : [];

        if (searchInAyantDroits) {
          usager.ayantsDroits.forEach((ad: UsagerAyantDroit) => {
            const dateNaissance =
              typeof ad.dateNaissance === "string"
                ? new Date(ad.dateNaissance)
                : null;
            attributes.push(format(dateNaissance, "dd/MM/yyyy"));
          });
        }
        return attributes;
      }

      attributes = [usager.nom, usager.prenom, usager.surnom, usager.customRef];

      if (searchInProcurations) {
        usager.options.procurations.forEach((procu: UsagerProcuration) => {
          attributes.push(procu.nom);
          attributes.push(procu.prenom);
        });
      }

      if (searchInAyantDroits) {
        usager.ayantsDroits.forEach((ad: UsagerAyantDroit) => {
          attributes.push(ad.nom);
          attributes.push(ad.prenom);
        });
      }

      return attributes;
    },
  });
}
