import { UsagersFilterCriteria } from "../UsagersFilterCriteria";
import { format } from "date-fns";
import {
  UsagerLight,
  UsagerAyantDroit,
} from "../../../../../../../_common/model";
import { search } from "../../../../../../shared";
import { UsagerProcuration } from "../../../../../usager-shared/interfaces/UsagerProcuration.interface";

export const usagersSearchStringFilter = {
  filter,
};

function filter(
  usagers: UsagerLight[],
  {
    searchString,
    searchStringField,
    searchInAyantDroits,
  }: Pick<
    UsagersFilterCriteria,
    "searchString" | "searchInAyantDroits" | "searchStringField"
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

        return attributes;
      } else if (searchStringField === "PROCURATION") {
        const procurationsAttributes = (usager.options.procurations ?? []).map(
          (procu: UsagerProcuration) => [procu.nom, procu.prenom]
        );
        return attributes.concat(...procurationsAttributes);
      }
      attributes = [usager.nom, usager.prenom, usager.surnom, usager.customRef];

      if (searchInAyantDroits) {
        const ayantDroitsAttributes = (usager.ayantsDroits ?? []).map(
          (ad: UsagerAyantDroit) => [ad.nom, ad.prenom]
        );
        return attributes.concat(...ayantDroitsAttributes);
      }
      return attributes;
    },
  });
}
