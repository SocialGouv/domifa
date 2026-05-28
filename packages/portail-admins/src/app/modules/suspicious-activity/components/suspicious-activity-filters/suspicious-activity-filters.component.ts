import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";

import { SecurityLogAction } from "@domifa/common";

import {
  SUSPICIOUS_ACTIONS,
  SUSPICIOUS_ACTION_LABELS,
} from "../../constants/SUSPICIOUS_ACTIONS.const";
import { SuspiciousActivityFilters } from "../../types/suspicious-activity-log";

@Component({
  selector: "app-suspicious-activity-filters",
  standalone: true,
  templateUrl: "./suspicious-activity-filters.component.html",
  imports: [CommonModule, ReactiveFormsModule],
})
export class SuspiciousActivityFiltersComponent implements OnInit {
  @Output() public readonly filtersChange =
    new EventEmitter<SuspiciousActivityFilters>();

  public readonly actions = SUSPICIOUS_ACTIONS;
  public actionLabel(action: SecurityLogAction): string {
    return SUSPICIOUS_ACTION_LABELS[action] ?? action;
  }

  public form!: FormGroup;

  constructor(private readonly fb: FormBuilder) {}

  public ngOnInit(): void {
    this.form = this.fb.group({
      action: this.fb.control<string | null>(null),
      dateFrom: this.fb.control<string | null>(null),
      dateTo: this.fb.control<string | null>(null),
      ip: this.fb.control<string | null>(null),
      identifier: this.fb.control<string | null>(null),
    });
  }

  public submit(): void {
    this.emit();
  }

  public reset(): void {
    this.form.reset({
      action: null,
      dateFrom: null,
      dateTo: null,
      ip: null,
      identifier: null,
    });
    this.emit();
  }

  // Called by the parent when an IP cell is clicked in the table — keeps the
  // form in sync with the active filter so a subsequent "Rechercher" submit
  // doesn't reset the IP back to empty.
  public setIp(ip: string): void {
    this.form.patchValue({ ip });
    this.emit();
  }

  private emit(): void {
    const v = this.form.value as {
      action: string | null;
      dateFrom: string | null;
      dateTo: string | null;
      ip: string | null;
      identifier: string | null;
    };

    const isKnownAction =
      typeof v.action === "string" &&
      (SUSPICIOUS_ACTIONS as string[]).includes(v.action);

    this.filtersChange.emit({
      actions: isKnownAction ? [v.action as SecurityLogAction] : undefined,
      dateFrom: v.dateFrom || undefined,
      dateTo: v.dateTo || undefined,
      ip: v.ip?.trim() || undefined,
      identifier: v.identifier?.trim() || undefined,
    });
  }
}
