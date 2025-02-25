import { Component, Input } from "@angular/core";

import { PortailUsagerPublic } from "@domifa/common";

@Component({
  selector: "app-section-options",
  templateUrl: "./section-options.component.html",
})
export class SectionOptionsComponent {
  @Input({ required: true }) public usager!: PortailUsagerPublic;
  public today = new Date();
}
