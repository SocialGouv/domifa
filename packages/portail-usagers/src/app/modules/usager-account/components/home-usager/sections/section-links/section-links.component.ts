import { NgIf } from "@angular/common";
import { Component, Input } from "@angular/core";
import { PortailUsagerPublic } from "@domifa/common";

@Component({
  selector: "app-section-links",
  standalone: true,
  imports: [NgIf],
  templateUrl: "./section-links.component.html",
  styleUrl: "./section-links.component.scss",
})
export class SectionLinksComponent {
  @Input() public usager!: PortailUsagerPublic;
}
