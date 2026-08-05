import { Component, input, output } from "@angular/core";
import { fadeIn } from "../../../../../shared";
import { MatomoTracker } from "ngx-matomo-client";
import {
  DsfrDropdownMenuComponent,
  DsfrDropdownMenuItemComponent,
} from "@edugouvfr/ngx-dsfr-ext";

@Component({
  animations: [fadeIn],
  selector: "app-landing-page-portail",
  standalone: true,
  templateUrl: "./landing-page-portail.component.html",
  styleUrls: ["./landing-page-portail.component.scss"],
  imports: [DsfrDropdownMenuComponent, DsfrDropdownMenuItemComponent],
})
export class LandingPagePortailComponent {
  public isLandingPage = input(true);
  public displayMenu = input(true);
  public activatePortail = output<void>();

  constructor(protected readonly matomo: MatomoTracker) {}
}
