import { ETAPE_ENTRETIEN } from "@domifa/common";
import { UsagerLight } from "../../../../../_common/model";
import {
  usagerEcheanceChecker,
  usagerInteractionTypeChecker,
  usagerPassageChecker,
  usagersSearchStringFilter,
  usagerStatutChecker,
} from "./services";
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
      searchStringField: criteria.searchStringField,
      searchInAyantDroits: criteria.searchInAyantDroits,
      searchInProcurations: criteria.searchInProcurations,
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
      return usager.rdv === null ||
        usager.etapeDemande > ETAPE_ENTRETIEN ||
        usager.rdv.dateRdv === null
        ? false
        : new Date() < new Date(usager.rdv.dateRdv);
    });
  } else if (criteria.entretien === "OVERDUE") {
    return usagers.filter((usager) => {
      return usager.rdv === null ||
        usager.etapeDemande > ETAPE_ENTRETIEN ||
        usager.rdv.dateRdv === null
        ? false
        : new Date() > new Date(usager.rdv.dateRdv);
    });
  }

  return usagers;
}
