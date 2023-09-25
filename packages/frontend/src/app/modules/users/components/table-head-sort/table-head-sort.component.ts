import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UsagersFilterCriteriaSortValues } from "../../../manage-usagers/components/usager-filter";
import {
  faArrowDown,
  faArrowUp,
  faSort,
} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: "app-table-head-sort",
  templateUrl: "./table-head-sort.component.html",
  styleUrls: ["./table-head-sort.component.scss"],
})
export class TableHeadSortComponent {
  public readonly faArrowDown = faArrowDown;
  public readonly faArrowUp = faArrowUp;
  public readonly faSort = faSort;

  @Input() public sortValue: UsagersFilterCriteriaSortValues;
  @Input() public columnName: string;
  @Input() public sortKey: string;
  @Input() public currentKey: string;

  @Output() public sortArray = new EventEmitter();
}
