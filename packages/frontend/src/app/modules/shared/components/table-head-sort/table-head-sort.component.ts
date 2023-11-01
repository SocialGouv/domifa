import { Component, EventEmitter, Input, Output } from "@angular/core";
import { UsagersFilterCriteriaSortValues } from "../../../manage-usagers/components/usager-filter";
import {
  faArrowDown,
  faArrowUp,
  faSort,
} from "@fortawesome/free-solid-svg-icons";
import { NgClass, NgIf } from "@angular/common";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";

@Component({
  selector: "app-table-head-sort",
  templateUrl: "./table-head-sort.component.html",
  styleUrls: ["./table-head-sort.component.scss"],
  standalone: true,
  imports: [NgIf, NgClass, FontAwesomeModule],
})
export class TableHeadSortComponent {
  public readonly faArrowDown = faArrowDown;
  public readonly faArrowUp = faArrowUp;
  public readonly faSort = faSort;

  @Input() public columnName: string;

  @Input() public sortValue: UsagersFilterCriteriaSortValues;
  @Output() public sortValueChange =
    new EventEmitter<UsagersFilterCriteriaSortValues>();

  @Input() public sortKey: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() public currentKey: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() public currentKeyChange = new EventEmitter<any>();

  public rotate() {
    const rotation: {
      [key in UsagersFilterCriteriaSortValues]: UsagersFilterCriteriaSortValues;
    } = {
      asc: "desc",
      desc: "asc",
    };
    if (this.currentKey === this.sortKey) {
      this.sortValueChange.emit(rotation[this.sortValue]);
    } else {
      this.currentKeyChange.emit(this.sortKey);
    }
  }
}
