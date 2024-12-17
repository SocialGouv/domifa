import { SortableValue, sortMultiple } from "@domifa/common";
import { UsagerLight } from "../../../../../../_common/model";
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

  return sortMultiple(usagers, asc, (usager) => {
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
  });
}

export function sortUsagersByCustomRef(
  usagers: UsagerLight[],
  asc: boolean
): UsagerLight[] {
  return sortMultiple(usagers, asc, (usager) => {
    const customRef = usager.customRef?.trim() || String(usager.ref);
    const isNumeric = /^\d+$/.test(customRef);

    return [
      isNumeric ? 0 : 1,
      isNumeric ? customRef.replace(/^0+/, "").length : 0,

      customRef.toLowerCase(),

      usager.nom.toLowerCase(),
      usager.prenom.toLowerCase(),
    ];
  });
}
