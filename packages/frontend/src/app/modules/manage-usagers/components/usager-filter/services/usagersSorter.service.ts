import { UsagerLight } from "../../../../../../_common/model";
import { dataSorter, SortableValue } from "../../../utils/sorter";
import { UsagersFilterCriteria } from "../UsagersFilterCriteria";

export const usagersSorter = {
  sortBy,
};

function sortBy(
  usagers: UsagerLight[],
  { sortKey, sortValue }: Pick<UsagersFilterCriteria, "sortKey" | "sortValue">
) {
  if (!sortKey) {
    return usagers;
  }

  const asc = sortValue !== "desc";

  if (sortKey === "ID") {
    return sortUsagersByCustomRef(usagers, asc);
  }

  return dataSorter.sortMultiple(usagers, asc, {
    getSortAttributes: (usager) => {
      const sortAttributes: SortableValue[] = [];

      if (sortKey === "ECHEANCE") {
        sortAttributes.push(usager?.echeanceInfos?.dateToDisplay ?? null);
      } else if (sortKey === "PASSAGE") {
        sortAttributes.push(usager?.lastInteraction?.dateInteraction);
      }

      sortAttributes.push(
        (usager.nom || "").toLowerCase(),
        (usager.prenom || "").toLowerCase(),
        usager.ref
      );

      if (usager.surnom) {
        sortAttributes.push(usager.surnom.toLowerCase());
      }

      return sortAttributes;
    },
  });
}

function sortUsagersByCustomRef(
  usagers: UsagerLight[],
  asc: boolean
): UsagerLight[] {
  return dataSorter.sortMultiple(usagers, asc, {
    getSortAttributes: (usager) => {
      const customRef = usager.customRef?.trim() || "";
      const isInteger = /^\d+$/.test(customRef);

      return [
        isInteger ? 0 : 1,
        isInteger
          ? parseInt(customRef, 10)
          : (customRef || usager.ref.toString()).toLowerCase(),
        (usager.nom || "").toLowerCase(),
        (usager.prenom || "").toLowerCase(),
      ];
    },
  });
}
