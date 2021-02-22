import { UsagerLight } from "../../../../../../../_common/model";
import { search } from "../../../../../../shared";
import { UsagersFilterCriteria } from "../UsagersFilterCriteria";

export const usagersSearchStringFilter = {
  filter,
};

function filter(
  usagers: UsagerLight[],
  {
    searchString,
    searchInAyantDroits,
  }: Pick<UsagersFilterCriteria, "searchString"|'searchInAyantDroits'>  
) {
  return search.filter(usagers, {
    searchText: searchString,
    getAttributes: (usager, i) => {
     
      const attributes = [
        usager.nom,
        usager.prenom,
        // usager.email,
        // usager.phone,
        usager.surnom,
        usager.customRef,
      ]
      if (searchInAyantDroits){
        const ayantDroitsAttributes = (usager.ayantsDroits ?? []).map((ad) => [
          ad.nom,
          ad.prenom,
        ]);
        return attributes.concat(...ayantDroitsAttributes);
      }
      return attributes;
    },
    sortResultsByBestMatch: false,
  });
}
