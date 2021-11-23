import { search } from "../../../../shared/services";
import {
  AdminStructureSListFilterCriteria,
  AdminStructuresListStructureModel,
} from "../model";

export const structuresSearchStringFilter = {
  filter,
};

function filter(
  structures: AdminStructuresListStructureModel[],
  { searchString }: Pick<AdminStructureSListFilterCriteria, "searchString">
) {
  return search.filter(structures, {
    searchText: searchString as string,
    getAttributes: (structure, i) => {
      const attributes = [
        `#${structure.id}`,
        structure.nom,
        structure.email,
        structure.phone,
        structure.region,
        structure.departement,
        structure.codePostal,
        structure.regionLabel,
        structure.departementLabel,
      ];

      return attributes;
    },
    sortResultsByBestMatch: true,
  });
}
