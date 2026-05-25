import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

import { SESSION_CLOSED_REASON_LABELS } from "../../constants/SUSPICIOUS_ACTIONS.const";
import { HistoricalSessionRecord } from "../../types/suspicious-activity-log";

@Component({
  selector: "app-sessions-history-table",
  standalone: true,
  templateUrl: "./sessions-history-table.component.html",
  imports: [CommonModule],
})
export class SessionsHistoryTableComponent {
  @Input() public sessions: HistoricalSessionRecord[] = [];

  public reasonLabel(reason: string): string {
    return SESSION_CLOSED_REASON_LABELS[reason] ?? reason;
  }

  public truncate(value: string | null | undefined, len = 12): string {
    if (!value) {
      return "—";
    }
    return value.length > len ? value.slice(0, len) + "…" : value;
  }
}
