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
  const filteredUsagers = filterByCriteria(usagers, criteria);

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
  criteria: UsagersFilterCriteria
) {
  const now = new Date().toISOString().split("T")[0];

  if (criteria.entretien) {
    return filterByEntretien(usagers, criteria.entretien, now);
  }

  const hasFilters =
    criteria.statut ||
    criteria.interactionType ||
    criteria.echeance ||
    criteria.lastInteractionDate;
  if (!hasFilters) {
    return usagers;
  }

  // Créer un tableau de fonctions de filtrage actives
  const activeFilters = [];

  if (criteria.statut) {
    activeFilters.push((usager: UsagerLight) =>
      usagerStatutChecker.check({ usager, statut: criteria.statut })
    );
  }

  if (criteria.interactionType) {
    activeFilters.push((usager: UsagerLight) =>
      usagerInteractionTypeChecker.check({
        usager,
        interactionType: criteria.interactionType,
      })
    );
  }

  if (criteria.echeance) {
    activeFilters.push((usager: UsagerLight) =>
      usagerEcheanceChecker.check({ usager, echeance: criteria.echeance })
    );
  }

  if (criteria.lastInteractionDate) {
    activeFilters.push((usager: UsagerLight) =>
      usagerPassageChecker.check({
        usager,
        lastInteractionDate: criteria.lastInteractionDate,
      })
    );
  }

  return usagers.filter((usager) =>
    activeFilters.every((activeFilter) => activeFilter(usager))
  );
}

function filterByEntretien(
  usagers: UsagerLight[],
  entretien: string,
  now: string
): UsagerLight[] {
  return usagers.filter((usager) => {
    if (!usager.rdv?.dateRdv || usager.etapeDemande > ETAPE_ENTRETIEN) {
      return false;
    }

    const dateRdv = new Date(usager.rdv.dateRdv).toISOString().split("T")[0];
    return entretien === "COMING" ? dateRdv > now : dateRdv < now;
  });
}
