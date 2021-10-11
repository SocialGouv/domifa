import { Component, Input, OnInit } from "@angular/core";
import { PortailUsagerPublic } from "../../../../_common";
import { USAGER_DECISION_STATUT_LABELS } from "../../../../_common/usager/constants";
import { DEFAULT_USAGER_PROFILE } from "./../../../../_common/mocks/DEFAULT_USAGER.const";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",
  styleUrls: ["./section-infos.component.css"],
})
export class SectionInfosComponent implements OnInit {
  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  @Input() public usager: PortailUsagerPublic;

  constructor() {
    this.usager = DEFAULT_USAGER_PROFILE.usager;
  }

  ngOnInit(): void {}
}
