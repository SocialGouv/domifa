import { Component, Input, OnInit } from "@angular/core";
import { UsagerEcheanceInfos } from "../../../../../../../_common";
import { DEFAULT_USAGER_PROFILE } from "../../../../../../../_common/mocks/DEFAULT_USAGER.const";

import {
  USAGER_DECISION_STATUT_LABELS,
  getRdvInfo,
  getEcheanceInfo,
  UsagerRdvInfo,
  PortailUsagerPublic,
} from "@domifa/common";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",

  styleUrl: "./section-infos.component.scss",
})
export class SectionInfosComponent implements OnInit {
  public readonly USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  @Input() public usager: PortailUsagerPublic;

  public echeanceInfo: UsagerEcheanceInfos;
  public rdvInfo: UsagerRdvInfo;

  constructor() {
    this.usager = DEFAULT_USAGER_PROFILE.usager;
    this.echeanceInfo = getEcheanceInfo(this.usager);
    this.rdvInfo = getRdvInfo(this.usager);
  }

  ngOnInit(): void {
    this.echeanceInfo = getEcheanceInfo(this.usager);
    this.rdvInfo = getRdvInfo({
      etapeDemande: this.usager.etapeDemande,
      rdv: this.usager.rdv,
    });
  }
}
