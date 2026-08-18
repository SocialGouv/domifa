import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { UserStructure } from "@domifa/common";
import { Subscription, interval } from "rxjs";
import { AuthService } from "../../../shared/services/auth.service";

@Component({
  selector: "app-support-mode-banner",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./support-mode-banner.component.html",
  styleUrl: "./support-mode-banner.component.css",
})
export class SupportModeBannerComponent implements OnInit, OnDestroy {
  public me: UserStructure | null = null;
  public remainingLabel = "";
  private readonly subscription = new Subscription();

  constructor(private readonly authService: AuthService) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe((user) => {
        this.me = user;
      })
    );

    this.subscription.add(interval(1000).subscribe(() => this.tick()));
    this.tick();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public quit(): void {
    this.authService.logout();
  }

  private tick(): void {
    if (!this.me?.supportMode || !this.me.supportModeExpiresAt) {
      return;
    }
    const remainingMs =
      new Date(this.me.supportModeExpiresAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      this.remainingLabel = "00:00:00";
      this.authService.logout();
      return;
    }
    this.remainingLabel = formatDuration(remainingMs);
  }
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");
}
