export type Filters =
  | "statut"
  | "name"
  | "passage"
  | "echeance"
  | "interactionType"
  | "sortKey"
  | "sortValue";

export type SortValues = "ascending" | "descending";

export type SearchStatut =
  | "TOUS"
  | "VALIDE"
  | "INSTRUCTION"
  | "ATTENTE_DECISION"
  | "REFUS"
  | "RADIE";

export class Search {
  public statut: SearchStatut;
  public name?: string;
  public echeance?: string;
  public interactionType?: string;
  public passage?: string;
  public sortKey?: string;
  public sortValue?: SortValues;
  public page: number;

  constructor(search?: any) {
    this.interactionType = (search && search.interactionType) || null;
    this.passage = (search && search.passage) || null;
    this.echeance = (search && search.echeance) || null;
    this.name = (search && search.name) || null;
    this.statut = (search && search.statut) || "VALIDE";
    this.page = (search && search.page) || 0;

    this.sortKey = (search && search.sortKey) || "NAME";
    this.sortValue = (search && search.sortValue) || "ascending";
  }
}
