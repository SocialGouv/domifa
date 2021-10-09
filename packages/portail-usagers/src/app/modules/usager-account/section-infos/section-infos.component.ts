import { Component, Input, OnInit } from "@angular/core";
import { PortailUsagerProfile, PortailUsagerPublic } from "../../../../_common";
import { USAGER_DECISION_STATUT_LABELS } from "../../../../_common/usager/constants";
import { DEFAULT_USAGER_PROFILE } from "./../../../../_common/mocks/DEFAULT_USAGER.const";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",
  styleUrls: ["./section-infos.component.css"],
})
export class SectionInfosComponent implements OnInit {
  @Input() public usagerProfile: PortailUsagerProfile | null;

  public usager: PortailUsagerPublic;
  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  constructor() {
    this.usagerProfile = DEFAULT_USAGER_PROFILE;
    this.usager = this.usagerProfile.usager;
  }

  ngOnInit(): void {}
}
