import { Component, EventEmitter, Input, Output } from "@angular/core";
import { fadeIn } from "../../../../../shared";
import { MatomoTracker } from "ngx-matomo-client";

@Component({
  animations: [fadeIn],
  selector: "app-landing-page-portail",
  templateUrl: "./landing-page-portail.component.html",
  styleUrls: ["./landing-page-portail.component.scss"],
})
export class LandingPagePortailComponent {
  @Input() public isLandingPage: boolean = true;
  @Input() public displayMenu: boolean = true;
  @Output() public activatePortail = new EventEmitter<void>();

  constructor(protected readonly matomo: MatomoTracker) {}
}
