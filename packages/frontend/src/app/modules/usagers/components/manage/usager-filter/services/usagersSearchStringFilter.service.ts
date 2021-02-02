import { UsagerLight } from "../../../../../../../_common/model";
import { search } from "../../../../../../shared";
import { UsagersFilterCriteria } from "../UsagersFilterCriteria";

export const usagersSearchStringFilter = {
  filter,
};

function filter(
  usagers: UsagerLight[],
  { searchString }: Pick<UsagersFilterCriteria, "searchString">
) {
  return search.filter(usagers, {
    searchText: searchString,
    getAttributes: (usager, i) => {
      const ayantDroitsAttributes = (usager.ayantsDroits ?? []).map((ad) => [
        ad.nom,
        ad.prenom,
      ]);
      const attributes = [
        usager.nom,
        usager.prenom,
        usager.email,
        usager.phone,
        usager.surnom,
        usager.customRef,
      ].concat(...ayantDroitsAttributes);
      return attributes;
    },
    sortResultsByBestMatch: true,
  });
}
