import { Component } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo-client";
import { globalConstants } from "../../../../../shared";

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

  handleChange(optOut: any) {
    if (optOut) {
      this.tracker.optUserOut();
      globalConstants.setItem("matomo-opted-in", false);
    } else {
      globalConstants.setItem("matomo-opted-in", true);
      this.tracker.forgetUserOptOut();
    }

    this.optedOut$ = this.tracker.isUserOptedOut();
  }
}
