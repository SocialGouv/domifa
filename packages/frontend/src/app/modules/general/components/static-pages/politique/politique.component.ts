import { Component, inject } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  selector: "app-politique",
  standalone: true,
  templateUrl: "./politique.component.html",
})
export class PolitiqueComponent {
  public optedOut = false;

  private readonly titleService = inject(Title);
  private readonly tracker = inject(MatomoTracker);

  constructor() {
    this.titleService.setTitle("Politique de confidentialité de DomiFa");
    this.tracker.isUserOptedOut().then((value) => (this.optedOut = value));
  }

  handleChange(optOut: boolean) {
    if (optOut) {
      this.tracker.optUserOut();
      localStorage.setItem("matomo-opted-in", JSON.stringify(false));
    } else {
      localStorage.setItem("matomo-opted-in", JSON.stringify(true));
      this.tracker.forgetUserOptOut();
    }

    this.tracker.isUserOptedOut().then((value) => (this.optedOut = value));
  }
}
