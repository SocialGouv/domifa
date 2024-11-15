import {
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
} from "@domifa/common";

export type UsagersFilterCriteriaSortValues = "asc" | "desc";

export type UsagersFilterCriteriaStatut =
  | "TOUS"
  | "VALIDE"
  | "INSTRUCTION"
  | "ATTENTE_DECISION"
  | "REFUS"
  | "RADIE";

export type UsagersFilterCriteriaSortKey =
  | "TOUS" // from UsagersFilterCriteriaStatut
  | "VALIDE" // from UsagersFilterCriteriaStatut
  | "INSTRUCTION" // from UsagersFilterCriteriaStatut
  | "ATTENTE_DECISION" // from UsagersFilterCriteriaStatut
  | "REFUS" // from UsagersFilterCriteriaStatut
  | "RADIE" // from UsagersFilterCriteriaStatut
  | "PASSAGE"
  | "NAME"
  | "ECHEANCE"
  | "ID";

export type UsagersFilterCriteriaEntretien = "COMING" | "OVERDUE";

export type CriteriaSearchField = "DEFAULT" | "DATE_NAISSANCE";
export class UsagersFilterCriteria {
  // text search filter
  // DEFAULT = Nom, prénom du domicilié, nom, prénom d'un des ayant-droits
  public searchStringField: CriteriaSearchField;
  public searchString: string | null;
  // filters
  public statut: UsagersFilterCriteriaStatut | null;
  public echeance: UsagersFilterCriteriaEcheance | null;
  public interactionType: "courrierIn" | null;
  public lastInteractionDate: UsagersFilterCriteriaDernierPassage | null;
  public entretien: UsagersFilterCriteriaEntretien | null;
  // order by
  public sortKey: UsagersFilterCriteriaSortKey;
  public sortValue?: UsagersFilterCriteriaSortValues;
  // pagination
  public page: number;
  public searchInAyantDroits = true;
  public searchInProcurations = true;

  constructor(search?: Partial<UsagersFilterCriteria> | null) {
    this.interactionType = search?.interactionType || null;
    this.lastInteractionDate = search?.lastInteractionDate || null;
    this.entretien = search?.entretien || null;
    this.echeance = search?.echeance || null;
    this.searchString = search?.searchString || null;
    this.searchStringField = search?.searchStringField || "DEFAULT";
    this.statut = search?.statut || "VALIDE";
    this.page = search?.page || 1;

    this.sortKey = search?.sortKey || "NAME";
    this.sortValue = search?.sortValue || "asc";

    // Ne pas trier par autre que les nom & ID si on est sur TOUS
    if (this.statut === "TOUS") {
      if (this.sortKey !== "ID" && this.sortKey !== "NAME") {
        this.sortKey = "NAME";
      }
    }
  }
}
