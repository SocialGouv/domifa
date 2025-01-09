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

    if (sortKey === "RDV" && usager?.rdv?.dateRdv) {
      sortAttributes.push(new Date(usager?.rdv?.dateRdv));
    } else if (sortKey === "ECHEANCE") {
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
  return usagers.sort((a, b) => {
    const refA = a.customRef?.trim() || String(a.ref);
    const refB = b.customRef?.trim() || String(b.ref);

    // Détecter si les références sont purement numériques
    const isNumericA = /^\d+$/.test(refA);
    const isNumericB = /^\d+$/.test(refB);

    // Si les deux sont numériques, comparer comme des nombres
    if (isNumericA && isNumericB) {
      const numA = parseInt(refA);
      const numB = parseInt(refB);
      return asc ? numA - numB : numB - numA;
    }

    // Si un seul est numérique, le mettre en premier
    if (isNumericA !== isNumericB) {
      return asc ? (isNumericA ? -1 : 1) : isNumericA ? 1 : -1;
    }

    // Sinon, tri alphabétique standard
    const comparison = refA.localeCompare(refB);
    return asc ? comparison : -comparison;
  });
}
