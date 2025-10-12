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
  public showRendezVousReminder!: boolean;
  public showWaitingForDecision!: boolean;
  public showApproachingExpiry!: boolean;
  public showExpirationMessage!: boolean;
  constructor() {
    this.echeanceInfo = getEcheanceInfo(this.usager);
    this.rdvInfo = getRdvInfo(this.usager);
  }

  ngOnInit(): void {
    this.showRendezVousReminder =
      this.usager.decision.statut === "INSTRUCTION" &&
      Boolean(this.rdvInfo?.content);

    this.showWaitingForDecision =
      this.usager.decision.statut === "ATTENTE_DECISION" &&
      this.usager.typeDom === "RENOUVELLEMENT";

    this.showApproachingExpiry =
      this.usager.decision.statut !== "ATTENTE_DECISION" &&
      this.echeanceInfo.dayBeforeEnd > 0 &&
      this.echeanceInfo.dayBeforeEnd < 60;

    this.showExpirationMessage =
      this.usager.decision.statut !== "ATTENTE_DECISION" &&
      this.echeanceInfo.dayBeforeEnd < 0;
  }
}
