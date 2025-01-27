import { SortValues } from "../types";

export class Search {
  public searchString: string | null;
  public sortKey: string;
  public sortValue: SortValues;
  public page = 1;

  constructor(search?: any) {
    this.searchString = search?.searchString ?? null;
    this.sortKey = search?.sortKey ?? null;
    this.sortValue = search?.sortValue ?? "asc";
    this.page = search?.page ?? 1;
  }
}
