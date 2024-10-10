import { dataCompare } from "../../../../shared/services";
import {
  AdminStructuresListSortAttribute,
  AdminStructuresListStructureModel,
} from "../../../model";

export const structuresSorter = {
  sortBy,
};

function sortBy(
  structuresVM: AdminStructuresListStructureModel[],
  {
    sortAttribute,
  }: {
    sortAttribute: {
      name: AdminStructuresListSortAttribute;
      asc: boolean;
    };
  }
) {
  const structuresVMWithSortKey = structuresVM.map(
    (ts: AdminStructuresListStructureModel) => {
      let sortKey: any;
      const defaultSortKey = (ts as any)[sortAttribute.name] as string;
      if (
        [
          "nom",
          "structureTypeLabel",
          "regionLabel",
          "departementLabel",
        ].includes(sortAttribute.name)
      ) {
        sortKey = dataCompare.cleanString(defaultSortKey);
      } else {
        sortKey = defaultSortKey;
      }

      return {
        ...ts,
        sortKey,
      };
    }
  );
  structuresVMWithSortKey.sort((a, b) => {
    return dataCompare.compareAttributes(a.sortKey, b.sortKey, {
      asc: sortAttribute.asc,
      nullFirst: false,
    });
  });
  return structuresVMWithSortKey;
}
