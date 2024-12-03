/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { NgClass } from "@angular/common";
import { TableHeadSortIconComponent } from "../table-head-sort-icon/table-head-sort-icon.component";
import { SortValues } from "@domifa/common";

@Component({
  selector: "app-table-head-sort",
  templateUrl: "./table-head-sort.component.html",
  styleUrls: ["./table-head-sort.component.scss"],
  standalone: true,
  imports: [TableHeadSortIconComponent, NgClass],
})
export class TableHeadSortComponent {
  @Input() public columnName!: string;

  @Input() public sortValue!: SortValues;
  @Output() public readonly sortValueChange = new EventEmitter<SortValues>();

  @Input() public currentKey!: string;
  @Output() public readonly currentKeyChange = new EventEmitter<string>();

  @Input() public sortKey!: string;
  @Output() public readonly sortArray = new EventEmitter<void>();

  public rotate() {
    const rotation: {
      [key in SortValues]: SortValues;
    } = {
      asc: "desc",
      desc: "asc",
    };
    if (this.currentKey === this.sortKey) {
      this.sortValueChange.emit(rotation[this.sortValue]);
    } else {
      this.currentKeyChange.emit(this.sortKey);
    }
    this.sortArray.emit();
  }
}
