import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from "@angular/core";
import { FormsModule } from "@angular/forms";

import { PAGE_SIZE_OPTIONS } from "../../../../shared/constants";

@Component({
  selector: "app-page-size-selector",
  imports: [CommonModule, FormsModule],
  templateUrl: "./page-size-selector.component.html",
  styleUrl: "./page-size-selector.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSizeSelectorComponent {
  @Input({ required: true }) public pageSize!: number;
  @Input() public options: readonly number[] = PAGE_SIZE_OPTIONS;
  @Input() public label = "Résultats par page";

  @Output() public readonly pageSizeChange = new EventEmitter<number>();

  // Counter-based id so multiple selectors on the same page keep distinct
  // `for=`/`id=` associations without callers having to thread an id input.
  public readonly fieldId = `page-size-${++PageSizeSelectorComponent.idCounter}`;
  private static idCounter = 0;

  public onChange(value: unknown): void {
    const next = Number(value);
    if (!Number.isFinite(next) || next <= 0 || next === this.pageSize) {
      return;
    }
    this.pageSizeChange.emit(next);
  }
}
