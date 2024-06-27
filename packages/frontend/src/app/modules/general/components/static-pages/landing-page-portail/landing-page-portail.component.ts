import { Component, EventEmitter, Input, Output } from "@angular/core";
import { fadeIn } from "../../../../../shared";

@Component({
  animations: [fadeIn],
  selector: "app-landing-page-portail",
  templateUrl: "./landing-page-portail.component.html",
  styleUrls: ["./landing-page-portail.component.scss"],
})
export class LandingPagePortailComponent {
  @Input() public isLandingPage: boolean;
  @Output() public activatePortail = new EventEmitter<void>();
}
