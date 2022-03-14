import { isFuture, isPast } from "date-fns";

import { UsagerLight } from "../../../../../../_common/model";
import {
  usagerEcheanceChecker,
  usagerInteractionTypeChecker,
  usagerPassageChecker,
  usagersSearchStringFilter,
  usagerStatutChecker,
} from "./services/";
import { usagersSorter } from "./services/usagersSorter.service";
import { UsagersFilterCriteria } from "./UsagersFilterCriteria";

export const usagersFilter = {
  filter,
};

function filter(
  usagers: UsagerLight[],
  {
    criteria,
  }: {
    criteria: UsagersFilterCriteria;
  }
) {
  const now = new Date();
  const filteredUsagers = filterByCriteria(usagers, criteria, now);

  const filteredAndSearchUsagers = usagersSearchStringFilter.filter(
    filteredUsagers,
    {
      searchString: criteria.searchString,
      searchInAyantDroits: criteria.searchInAyantDroits,
    }
  );

  return usagersSorter.sortBy(filteredAndSearchUsagers, {
    sortKey: criteria.sortKey,
    sortValue: criteria.sortValue,
  });
}

function filterByCriteria(
  usagers: UsagerLight[],
  criteria: UsagersFilterCriteria,
  now: Date
) {
  if (
    criteria.statut ||
    criteria.interactionType ||
    criteria.echeance ||
    criteria.passage
  ) {
    return usagers.filter((usager) => {
      return (
        usagerStatutChecker.check({
          usager,
          statut: criteria.statut,
        }) &&
        usagerInteractionTypeChecker.check({
          usager,
          interactionType: criteria.interactionType,
        }) &&
        usagerEcheanceChecker.check({
          usager,
          echeance: criteria.echeance,
          refDateNow: now,
        }) &&
        usagerPassageChecker.check({
          usager,
          passage: criteria.passage,
          refDateNow: now,
        })
      );
    });
  } else if (criteria.entretien === "COMING") {
    return usagers.filter((usager) => {
      if (usager.rdv === null) return false;

      const date = new Date(usager.rdv.dateRdv);

      return isFuture(date);
    });
  } else if (criteria.entretien === "OVERDUE") {
    return usagers.filter((usager) => {
      if (usager.rdv === null) return false;

      const date = new Date(usager.rdv.dateRdv);

      return isPast(date);
    });
  }
  return usagers;
}
