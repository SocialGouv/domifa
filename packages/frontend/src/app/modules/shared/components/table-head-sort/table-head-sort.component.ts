import { Component, EventEmitter, Input, Output } from "@angular/core";
import { TableHeadSortIconComponent } from "../table-head-sort-icon/table-head-sort-icon.component";
import { SortValues } from "@domifa/common";

@Component({
  selector: "app-table-head-sort",
  templateUrl: "./table-head-sort.component.html",
  standalone: true,
  imports: [TableHeadSortIconComponent],
})
export class TableHeadSortComponent {
  @Input({ required: true }) public columnName: string;

  @Input({ required: true }) public sortValue: SortValues;
  @Output() public readonly sortValueChange = new EventEmitter<SortValues>();

  @Input({ required: true }) public currentKey: string;
  @Output() public readonly currentKeyChange = new EventEmitter<string>();

  @Input() public sortKey: string;
  @Output() public readonly sortArray = new EventEmitter<void>();

  public rotate(): void {
    const rotation: Record<SortValues, SortValues> = {
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

  public get buttonClass(): string {
    if (this.sortKey !== this.currentKey) {
      return "fr-btn";
    }
    return `fr-btn fr-btn--sort-${this.sortValue}`;
  }
}
