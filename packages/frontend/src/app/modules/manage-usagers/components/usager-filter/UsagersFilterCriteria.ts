import {
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
} from "@domifa/common";
import { SortValues } from "../../../../../_common/model";

export type UsagersFilterCriteriaStatut =
  | "TOUS"
  | "VALIDE"
  | "INSTRUCTION"
  | "ATTENTE_DECISION"
  | "REFUS"
  | "RADIE";

export type UsagersFilterCriteriaSortKey =
  | "PASSAGE"
  | "NOM"
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
  public sortValue: SortValues;
  // pagination
  public page: number;

  constructor(search?: Partial<UsagersFilterCriteria> | null) {
    this.interactionType = search?.interactionType || null;
    this.lastInteractionDate = search?.lastInteractionDate || null;
    this.entretien = search?.entretien || null;
    this.echeance = search?.echeance || null;
    this.searchString = search?.searchString || null;
    this.searchStringField = search?.searchStringField || "DEFAULT";
    this.statut = search?.statut || "VALIDE";
    this.page = search?.page || 1;

    this.sortKey = search?.sortKey || "NOM";
    this.sortValue = search?.sortValue || "asc";
  }
}
