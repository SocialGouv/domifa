import { Component, Input, OnInit } from "@angular/core";
import { PortailUsagerProfile, PortailUsagerPublic } from "../../../../_common";
import { DEFAULT_USAGER_PROFILE } from "../../../../_common/mocks/DEFAULT_USAGER.const";

@Component({
  selector: "app-section-courriers",
  templateUrl: "./section-courriers.component.html",
  styleUrls: ["./section-courriers.component.css"],
})
export class SectionCourriersComponent implements OnInit {
  @Input() public usagerProfile: PortailUsagerProfile | null;

  public usager: PortailUsagerPublic;

  constructor() {
    this.usagerProfile = DEFAULT_USAGER_PROFILE;
    this.usager = this.usagerProfile.usager;
  }

  ngOnInit(): void {}
}
