import { Component, OnDestroy, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";

import { UserStructure } from "@domifa/common";
import { AuthService } from "../../../../../shared/services/auth.service";

const STORAGE_KEY = "alerte-mail-generique-dismissed-at";
const SNOOZE_DURATION_MS = 24 * 60 * 60 * 1000;

@Component({
  selector: "app-alerte-mail-generique",
  imports: [CommonModule],
  templateUrl: "./alerte-mail-generique.component.html",
})
export class AlerteMailGeneriqueComponent implements OnInit, OnDestroy {
  public hidden = true;

  private readonly subscription = new Subscription();

  constructor(private readonly authService: AuthService) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe({
        next: (user: UserStructure | null) => {
          this.hidden = !this.shouldDisplay(user);
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public close(): void {
    this.hidden = true;
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  private shouldDisplay(user: UserStructure | null): boolean {
    if (!user || !user.emailStatus) {
      return false;
    }
    if (
      user.emailStatus !== "GENERIC_CONFIRMED" &&
      user.emailStatus !== "GENERIC_SUSPECTED"
    ) {
      return false;
    }
    return !this.isSnoozed();
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
