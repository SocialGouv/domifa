import { Component, Input } from "@angular/core";
import { SortValues } from "@domifa/common";

@Component({
  standalone: true,
  selector: "app-table-head-sort-icon",
  templateUrl: "./table-head-sort-icon.component.html",
})
export class TableHeadSortIconComponent {
  public readonly SORT_ORDER_LABEL = {
    asc: "ordre croissant",
    desc: "ordre décroissant",
  };

  @Input({ required: true })
  public sortKey: string;

  @Input({ required: true })
  public sortValue: SortValues;

  @Input({ required: true })
  public currentKey: string;

  public get isActive(): boolean {
    return this.sortKey === this.currentKey;
  }

  public get icon(): string {
    if (!this.isActive) {
      return "fr-icon-arrow-up-down-line";
    }
    return this.sortValue === "desc"
      ? "fr-icon-arrow-down-fill"
      : "fr-icon-arrow-up-fill";
  }
}
