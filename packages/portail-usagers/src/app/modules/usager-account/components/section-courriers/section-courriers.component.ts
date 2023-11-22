import { Component, Input } from "@angular/core";

import { DEFAULT_USAGER_PROFILE } from "../../../../../_common/mocks/DEFAULT_USAGER.const";
import { PortailUsagerPublic } from "@domifa/common";

@Component({
  selector: "app-section-courriers",
  templateUrl: "./section-courriers.component.html",
  styleUrls: ["./section-courriers.component.css"],
})
export class SectionCourriersComponent {
  @Input() public usager!: PortailUsagerPublic;

  constructor() {
    this.usager = DEFAULT_USAGER_PROFILE.usager;
  }
}
