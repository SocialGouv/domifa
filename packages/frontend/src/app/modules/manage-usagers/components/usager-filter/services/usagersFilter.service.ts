import {
  CriteriaSearchField,
  buildWords,
  search,
  UsagersFilterCriteriaEntretien,
  ETAPE_ENTRETIEN,
} from "@domifa/common";
import { isValid, parse } from "date-fns";
import { UsagerLight } from "../../../../../../_common/model";
import { UsagersFilterCriteria } from "../../../classes/UsagersFilterCriteria";
import {
  getAttributes,
  usagerStatutChecker,
  usagerInteractionTypeChecker,
  usagerEcheanceChecker,
  usagerPassageChecker,
} from "../../../services/usager-filter";

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
): UsagerLight[] {
  return filterByCriteria(usagers, criteria);
}

function filterByCriteria(
  usagers: UsagerLight[],
  criteria: UsagersFilterCriteria
): UsagerLight[] {
  // Si pas de filtres ni de recherche textuelle après le traitement entretien
  const activeFilters = buildActiveFilters(criteria);

  if (!criteria.searchString && !activeFilters.length) {
    return usagers;
  }

  let words = [];

  if (criteria.searchString) {
    if (criteria.searchStringField === CriteriaSearchField.BIRTH_DATE) {
      const parsedDate = parse(
        criteria.searchString.trim(),
        "dd/MM/yyyy",
        new Date()
      );

      if (isValid(parsedDate)) {
        words.push(criteria.searchString);
      }
    } else {
      words = buildWords(criteria.searchString);
    }
  }

  return usagers.filter((usager) => {
    if (
      activeFilters.length &&
      !activeFilters.every((filter) => filter(usager))
    ) {
      return false;
    }

    if (words.length === 0) {
      return true;
    }

    const attributes = getAttributes(usager, criteria);

    if (criteria.searchStringField === "BIRTH_DATE") {
      return attributes.includes(criteria.searchString);
    }

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

  if (criteria.entretien) {
    activeFilters.push((usager: UsagerLight) =>
      filterByEntretien(usager, criteria.entretien)
    );
  }

  if (typeof criteria.referrerId !== "undefined") {
    activeFilters.push(
      (usager: UsagerLight) => usager.referrerId === criteria.referrerId
    );
  }

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

function filterByEntretien(
  usager: UsagerLight,
  entretien: UsagersFilterCriteriaEntretien
): boolean {
  const now = new Date().toISOString().split("T")[0];

  if (!usager.rdv?.dateRdv || usager.etapeDemande > ETAPE_ENTRETIEN) {
    return false;
  }

  const dateRdv = new Date(usager.rdv.dateRdv).toISOString().split("T")[0];
  return entretien === UsagersFilterCriteriaEntretien.COMING
    ? dateRdv > now
    : dateRdv < now;
}
