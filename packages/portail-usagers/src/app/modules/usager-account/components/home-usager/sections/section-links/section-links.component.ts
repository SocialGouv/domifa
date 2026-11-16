import { Component, Input } from "@angular/core";
import { PortailUsagerPublic } from "@domifa/common";

@Component({
  selector: "app-section-links",
  imports: [],
  templateUrl: "./section-links.component.html",
})
export class SectionLinksComponent {
  @Input() public usager!: PortailUsagerPublic;
}
