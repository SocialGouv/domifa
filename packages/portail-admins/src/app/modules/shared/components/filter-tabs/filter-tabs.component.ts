import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";

export interface FilterTab {
  key: string;
  label: string;
  count: number;
}

@Component({
  selector: "app-filter-tabs",
  templateUrl: "./filter-tabs.component.html",
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterTabsComponent {
  @Input({ required: true }) public tabs: FilterTab[] = [];
  @Input({ required: true }) public selectedKey!: string;
  @Input({ required: true }) public ariaLabel!: string;
  @Output() public readonly select = new EventEmitter<string>();

  public onSelect(key: string): void {
    if (key !== this.selectedKey) {
      this.select.emit(key);
    }
  }

  public trackByKey(_index: number, tab: FilterTab): string {
    return tab.key;
  }
}
