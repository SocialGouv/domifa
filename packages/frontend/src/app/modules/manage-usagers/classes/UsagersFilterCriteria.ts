import {
  CriteriaSearchField,
  Search,
  UsagersFilterCriteriaDernierPassage,
  UsagersFilterCriteriaEcheance,
  UsagersFilterCriteriaEntretien,
  UsagersFilterCriteriaStatut,
} from "@domifa/common";

export type UsagersFilterCriteriaSortKey =
  | "PASSAGE"
  | "NOM"
  | "ECHEANCE"
  | "RDV"
  | "ID";

export class UsagersFilterCriteria extends Search {
  // text search filter
  // DEFAULT = Nom, prénom du domicilié, nom, prénom d'un des ayant-droit
  public searchStringField: CriteriaSearchField;
  // filters
  public statut: UsagersFilterCriteriaStatut | null;
  public echeance: UsagersFilterCriteriaEcheance | null;
  public interactionType: "courrierIn" | null;
  public lastInteractionDate: UsagersFilterCriteriaDernierPassage | null;
  public entretien: UsagersFilterCriteriaEntretien | null;
  public referrerId?: number | null = undefined;
  // order by
  public sortKey: UsagersFilterCriteriaSortKey;

  constructor(search?: Partial<UsagersFilterCriteria> | null) {
    super(search);
    this.interactionType = search?.interactionType || null;
    this.lastInteractionDate = search?.lastInteractionDate || null;
    this.entretien = search?.entretien || null;
    this.echeance = search?.echeance || null;
    this.searchString = search?.searchString || null;
    this.searchStringField =
      search?.searchStringField || CriteriaSearchField.DEFAULT;
    this.statut = search?.statut || UsagersFilterCriteriaStatut.VALIDE;
    this.page = search?.page || 1;
    this.sortKey = search?.sortKey || "NOM";
    this.sortValue = search?.sortValue || "asc";
    this.referrerId =
      search?.referrerId || search?.referrerId === null
        ? search?.referrerId
        : undefined;
  }
}
