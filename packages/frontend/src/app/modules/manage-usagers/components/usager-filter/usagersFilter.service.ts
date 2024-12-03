import { buildWords, ETAPE_ENTRETIEN, search } from "@domifa/common";
import { UsagerLight } from "../../../../../_common/model";
import {
  getAttributes,
  usagerEcheanceChecker,
  usagerInteractionTypeChecker,
  usagerPassageChecker,
  usagerStatutChecker,
} from "./services";
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
  return filterByCriteria(usagers, criteria);
}

function filterByCriteria(
  usagers: UsagerLight[],
  criteria: UsagersFilterCriteria
) {
  const now = new Date().toISOString().split("T")[0];

  if (criteria.entretien) {
    return filterByEntretien(usagers, criteria.entretien, now);
  }

  const words = criteria.searchString ? buildWords(criteria.searchString) : [];
  const needsTextSearch = words.length > 0;

  // Si pas de filtres ni de recherche textuelle après le traitement entretien
  if (!needsTextSearch && !hasAnyCriteria(criteria)) {
    return usagers;
  }

  const activeFilters = buildActiveFilters(criteria);

  return usagers.filter((usager) => {
    if (
      activeFilters.length &&
      !activeFilters.every((filter) => filter(usager))
    ) {
      return false;
    }

    // Si pas de recherche textuelle, on a notre réponse
    if (!needsTextSearch) {
      return true;
    }
    const attributes = getAttributes(usager, criteria);

    return search.match(usager, {
      index: 0,
      getAttributes: () => attributes,
      words,
      withScore: false,
    }).match;
  });
}

function buildActiveFilters(criteria: UsagersFilterCriteria) {
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
  return activeFilters;
}

function hasAnyCriteria(criteria: UsagersFilterCriteria): boolean {
  return !!(
    criteria.statut ||
    criteria.interactionType ||
    criteria.echeance ||
    criteria.lastInteractionDate ||
    criteria.entretien
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
