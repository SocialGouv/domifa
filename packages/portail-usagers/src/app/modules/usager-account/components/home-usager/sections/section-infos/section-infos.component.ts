import { Component, Input, OnInit } from "@angular/core";
import { UsagerEcheanceInfos } from "../../../../../../../_common";
import { DEFAULT_USAGER_PROFILE } from "../../../../../../../_common/mocks/DEFAULT_USAGER.const";

import { getEcheanceInfos } from "../../../../interfaces/getEcheanceInfos.service";
import {
  USAGER_DECISION_STATUT_LABELS,
  getRdvInfos,
  UsagerRdvInfos,
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

  public echeanceInfos: UsagerEcheanceInfos;
  public rdvInfos: UsagerRdvInfos;

  constructor() {
    this.usager = DEFAULT_USAGER_PROFILE.usager;
    this.echeanceInfos = getEcheanceInfos(this.usager);
    this.rdvInfos = getRdvInfos(this.usager);
  }

  ngOnInit(): void {
    this.echeanceInfos = getEcheanceInfos(this.usager);
    this.rdvInfos = getRdvInfos({
      etapeDemande: this.usager.etapeDemande,
      rdv: this.usager.rdv,
    });
  }
}
