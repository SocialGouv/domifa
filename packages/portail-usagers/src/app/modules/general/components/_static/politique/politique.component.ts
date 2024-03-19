import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  selector: "app-politique",
  templateUrl: "./politique.component.html",
})
export class PolitiqueComponent {
  optedOut$: Promise<boolean>;

  public constructor(
    private readonly titleService: Title,
    private readonly tracker: MatomoTracker,
  ) {
    this.optedOut$ = tracker.isUserOptedOut();
    this.titleService.setTitle("Politique de confidentialité de Mon DomiFa");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handleChange(optOut: any) {
    if (optOut) {
      this.tracker.optUserOut();
      localStorage.setItem("matomo-opted-in", JSON.stringify(false));
    } else {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
      this.tracker.forgetUserOptOut();
    }

    this.optedOut$ = this.tracker.isUserOptedOut();
  }
}
