import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { UserStructure } from "@domifa/common";
import { Subscription } from "rxjs";
import { AuthService } from "../../../shared/services/auth.service";

// OnPush + the interval scheduled OUTSIDE Angular's zone: a naive
// setInterval/RxJS interval() ticking every second runs INSIDE the zone by
// default, which triggers a *global* change-detection pass across the whole
// app on every tick — including every other mounted component, regardless
// of its own change-detection strategy (OnPush only protects against
// ancestor-triggered checks; it does nothing to stop a sibling/unrelated
// component from choosing to walk the whole tree). A visible countdown is
// exactly the kind of thing that's easy to get wrong here: since this
// banner is global (always mounted in AppComponent), it would otherwise
// force a full app-wide CD pass every second for as long as a support
// session is active — the worst possible moment, since support mode is
// also when large, list-heavy pages (e.g. the dossiers table) are most
// likely to be open. Running the timer outside the zone and calling
// `detectChanges()` (not `markForCheck()`) keeps the DOM update scoped to
// this component's own view only.
@Component({
  selector: "app-support-mode-banner",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./support-mode-banner.component.html",
  styleUrl: "./support-mode-banner.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportModeBannerComponent implements OnInit, OnDestroy {
  public me: UserStructure | null = null;
  public remainingLabel = "";
  private readonly subscription = new Subscription();
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(
    private readonly authService: AuthService,
    private readonly ngZone: NgZone,
    private readonly cd: ChangeDetectorRef
  ) {}

  public ngOnInit(): void {
    this.subscription.add(
      this.authService.currentUserSubject.subscribe((user) => {
        this.me = user;
        this.tick();
        this.cd.detectChanges();
      })
    );

    this.ngZone.runOutsideAngular(() => {
      this.intervalId = setInterval(() => {
        this.tick();
        this.cd.detectChanges();
      }, 1000);
    });
    this.tick();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  public quit(): void {
    // logout() only clears local state — logoutFromBackend() hits
    // GET structures/auth/logout first, which is where the support-session
    // revoke hook lives (structures-auth.controller.ts). Without it the
    // support_session row stays ACTIVE until the cron sweeps it up to an
    // hour later.
    this.authService.logoutFromBackend();
  }

  private tick(): void {
    if (this.me?.role !== "support" || !this.me.supportAttachmentExpiresAt) {
      return;
    }
    const remainingMs =
      new Date(this.me.supportAttachmentExpiresAt).getTime() - Date.now();
    if (remainingMs <= 0) {
      this.remainingLabel = "00:00:00";
      // logoutFromBackend does its own navigation/window.location redirect
      // — re-entering the zone for that one call is correct and necessary.
      this.ngZone.run(() => this.authService.logoutFromBackend());
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
