import { Component, Input, OnInit } from "@angular/core";

import {
  USAGER_DECISION_STATUT_LABELS,
  getRdvInfo,
  getEcheanceInfo,
  UsagerRdvInfo,
  UsagerEcheanceInfo,
  PortailUsagerPublic,
} from "@domifa/common";

@Component({
  selector: "app-section-infos",
  templateUrl: "./section-infos.component.html",
  styleUrl: "./section-infos.component.scss",
})
export class SectionInfosComponent implements OnInit {
  public readonly USAGER_DECISION_STATUT_LABELS = USAGER_DECISION_STATUT_LABELS;

  @Input({ required: true }) public usager!: PortailUsagerPublic;

  public echeanceInfo: UsagerEcheanceInfo;
  public rdvInfo: UsagerRdvInfo;

  constructor() {
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
