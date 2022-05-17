export type UsagersFilterCriteriaSortValues = "ascending" | "descending";

export type UsagersFilterCriteriaStatut =
  | "TOUS"
  | "VALIDE"
  | "INSTRUCTION"
  | "ATTENTE_DECISION"
  | "REFUS"
  | "RADIE"
  | "RENOUVELLEMENT";

export type UsagersFilterCriteriaSortKey =
  | "TOUS" // from UsagersFilterCriteriaStatut
  | "VALIDE" // from UsagersFilterCriteriaStatut
  | "INSTRUCTION" // from UsagersFilterCriteriaStatut
  | "ATTENTE_DECISION" // from UsagersFilterCriteriaStatut
  | "REFUS" // from UsagersFilterCriteriaStatut
  | "RADIE" // from UsagersFilterCriteriaStatut
  | "RENOUVELLEMENT" // from UsagersFilterCriteriaStatut => TODO @toub apparemment pas géré dans le traitement de tri
  | "PASSAGE"
  | "NAME"
  | "ECHEANCE"
  | "ID";

export type UsagersFilterCriteriaEcheance =
  | "DEPASSEE"
  | "DEUX_MOIS"
  | "DEUX_SEMAINES";

export type UsagersFilterCriteriaEntretien = "COMING" | "OVERDUE";

export type UsagersFilterCriteriaDernierPassage = "DEUX_MOIS" | "TROIS_MOIS";

export class UsagersFilterCriteria {
  // text search filter
  public searchString: string | null;
  // filters
  public statut: UsagersFilterCriteriaStatut;
  public echeance: UsagersFilterCriteriaEcheance | null;
  public interactionType: "courrierIn" | null;
  public passage: UsagersFilterCriteriaDernierPassage | null;
  public entretien: UsagersFilterCriteriaEntretien | null;
  // order by
  public sortKey?: UsagersFilterCriteriaSortKey;
  public sortValue?: UsagersFilterCriteriaSortValues;
  // pagination
  public page: number;
  public searchInAyantDroits = true;

  constructor(search?: Partial<UsagersFilterCriteria> | null) {
    this.interactionType = (search && search.interactionType) || null;
    this.passage = (search && search.passage) || null;
    this.entretien = (search && search.entretien) || null;
    this.echeance = (search && search.echeance) || null;
    this.searchString = (search && search.searchString) || null;
    this.statut = (search && search.statut) || "VALIDE";
    this.page = (search && search.page) || 0;

    this.sortKey = (search && search.sortKey) || "NAME";
    this.sortValue = (search && search.sortValue) || "ascending";

    // Ne pas trier par autre que les nom & ID si on est sur TOUS
    if (this.statut === "TOUS") {
      if (this.sortKey !== "ID" && this.sortKey !== "NAME") {
        this.sortKey = "NAME";
      }
    }
  }
}
