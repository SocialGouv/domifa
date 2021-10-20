import { Component, Input, OnInit } from "@angular/core";
import {
  PortailUsagerPublic,
  UsagerEcheanceInfos,
  UsagerRdvInfos,
} from "../../../../../_common";
import { DEFAULT_USAGER_PROFILE } from "../../../../../_common/mocks/DEFAULT_USAGER.const";
import { USAGER_DECISION_STATUT_LABELS } from "../../../../../_common/usager/constants";
import { getEcheanceInfos } from "../../interfaces/getEcheanceInfos.service";
import { getRdvInfos } from "../../interfaces/getRdvInfos.service";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",
  styleUrls: ["./section-infos.component.css"],
})
export class SectionInfosComponent implements OnInit {
  public USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

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
    this.rdvInfos = getRdvInfos(this.usager);
  }
}
