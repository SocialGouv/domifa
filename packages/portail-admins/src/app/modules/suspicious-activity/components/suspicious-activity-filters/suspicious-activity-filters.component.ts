import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { Subscription } from "rxjs";
import { debounceTime } from "rxjs/operators";

import { SecurityLogAction } from "@domifa/common";

import {
  SUSPICIOUS_ACTIONS,
  SUSPICIOUS_ACTION_LABELS,
} from "../../constants/SUSPICIOUS_ACTIONS.const";
import {
  SUSPICIOUS_FILTER_USER_TYPES,
  SUSPICIOUS_FILTER_USER_TYPE_LABELS,
} from "../../constants/SUSPICIOUS_FILTER_USER_TYPES.const";
import {
  SuspiciousActivityFilters,
  SuspiciousFilterUserType,
} from "../../types/suspicious-activity-log";

// Debounce window for free-text inputs (IP, identifier). Selects/dates emit
// through the same pipe so they pay this delay too — at 300 ms it's below
// the perceptual threshold and avoids a second emission path.
const FILTER_DEBOUNCE_MS = 300;

@Component({
  selector: "app-suspicious-activity-filters",
  standalone: true,
  templateUrl: "./suspicious-activity-filters.component.html",
  imports: [CommonModule, ReactiveFormsModule],
})
export class SuspiciousActivityFiltersComponent implements OnInit, OnDestroy {
  @Output() public readonly filtersChange =
    new EventEmitter<SuspiciousActivityFilters>();

  public readonly actions = SUSPICIOUS_ACTIONS;
  public readonly userTypes = SUSPICIOUS_FILTER_USER_TYPES;

  public actionLabel(action: SecurityLogAction): string {
    return SUSPICIOUS_ACTION_LABELS[action] ?? action;
  }

  public userTypeLabel(userType: SuspiciousFilterUserType): string {
    return SUSPICIOUS_FILTER_USER_TYPE_LABELS[userType] ?? userType;
  }

  public form!: FormGroup;

  private readonly subscription = new Subscription();

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      action: this.fb.control<string | null>(null),
      userType: this.fb.control<string | null>(null),
      dateFrom: this.fb.control<string | null>(null),
      dateTo: this.fb.control<string | null>(null),
      ip: this.fb.control<string | null>(null),
      identifier: this.fb.control<string | null>(null),
    });

    this.subscription.add(
      this.form.valueChanges
        .pipe(debounceTime(FILTER_DEBOUNCE_MS))
        .subscribe(() => this.emit())
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  // Called by the parent when an IP cell is clicked in the table — keeps the
  // form in sync with the active filter so a subsequent user edit doesn't
  // reset the IP back to empty. The patch triggers `valueChanges` which
  // re-emits through the debounced pipeline.
  public setIp(ip: string): void {
    this.form.patchValue({ ip });
  }

  private emit(): void {
    const v = this.form.value as {
      action: string | null;
      userType: string | null;
      dateFrom: string | null;
      dateTo: string | null;
      ip: string | null;
      identifier: string | null;
    };

    const isKnownAction =
      typeof v.action === "string" &&
      (SUSPICIOUS_ACTIONS as string[]).includes(v.action);
    const isKnownUserType =
      typeof v.userType === "string" &&
      (SUSPICIOUS_FILTER_USER_TYPES as string[]).includes(v.userType);

    this.filtersChange.emit({
      actions: isKnownAction ? [v.action as SecurityLogAction] : undefined,
      userType: isKnownUserType
        ? (v.userType as SuspiciousFilterUserType)
        : undefined,
      dateFrom: v.dateFrom || undefined,
      dateTo: v.dateTo || undefined,
      ip: v.ip?.trim() || undefined,
      identifier: v.identifier?.trim() || undefined,
    });
  }
}
