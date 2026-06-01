import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

const STORAGE_KEY = "alerte-2fa-deploy-dismissed-at";
const SNOOZE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

@Component({
  selector: "app-alerte-2fa",
  imports: [CommonModule],
  templateUrl: "./alerte-2fa.component.html",
})
export class Alerte2faComponent {
  public hidden: boolean;

  constructor() {
    this.hidden = this.isSnoozed();
  }

  public close(): void {
    this.hidden = true;
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  private isSnoozed(): boolean {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return false;
    }
    const dismissedAt = Number(raw);
    if (!Number.isFinite(dismissedAt)) {
      return false;
    }
    return Date.now() - dismissedAt < SNOOZE_DURATION_MS;
  }
}
