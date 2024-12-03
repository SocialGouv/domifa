import { NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faArrowDown,
  faArrowUp,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { UsagersFilterCriteriaSortKey } from "../../../manage-usagers/components/usager-filter";
import { SortValues } from "@domifa/common";

@Component({
  standalone: true,
  selector: "app-table-head-sort-icon",
  templateUrl: "./table-head-sort-icon.component.html",
  imports: [NgIf, FontAwesomeModule],
})
export class TableHeadSortIconComponent {
  public readonly faArrowDown = faArrowDown;
  public readonly faArrowUp = faArrowUp;
  public readonly faSort = faSort;

  public readonly SORT_ORDER_LABEL = {
    asc: "ordre croissant",
    desc: "ordre décroissant",
  };

  @Input({ required: true })
  public sortKey: UsagersFilterCriteriaSortKey | string;

  @Input({ required: true }) public sortValue: SortValues;
  @Input({ required: true }) public currentKey: string;
}
