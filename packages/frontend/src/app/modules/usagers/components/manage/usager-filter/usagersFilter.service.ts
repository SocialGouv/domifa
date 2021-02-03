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
  const filteredUsagers = usagers.filter((usager) => {
    const now = new Date();
    const today = Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    );

    if (criteria.passage) {
      // TODO @toub
      switch (criteria.passage) {
        case "DEUX_MOIS":
          // { $lte: lastTwoMonths },
          break;
        case "TROIS_MOIS":
          // { $lte: lastThreeMonths },
          break;
      }
    }

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
      }) &&
      usagerPassageChecker.check({
        usager,
        passage: criteria.passage,
      })
    );
  });

  const filteredAndSearchUsagers = usagersSearchStringFilter.filter(
    filteredUsagers,
    {
      searchString: criteria.searchString,
    }
  );
  return usagersSorter.sortBy(filteredAndSearchUsagers, {
    sortKey: criteria.sortKey,
    sortValue: criteria.sortValue,
  });
}
