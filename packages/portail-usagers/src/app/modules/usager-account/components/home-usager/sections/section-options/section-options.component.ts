import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";

import { PortailUsagerPublic } from "@domifa/common";

@Component({
  selector: "app-section-options",
  templateUrl: "./section-options.component.html",
  imports: [CommonModule],
})
export class SectionOptionsComponent implements OnInit {
  @Input({ required: true }) public usager!: PortailUsagerPublic;
  public today = new Date();
  public hasActiveTransfertOrProcur = false;

  ngOnInit(): void {
    const transfert = this.usager.options.transfert;
    const procurations = this.usager.options.procurations;
    this.hasActiveTransfertOrProcur =
      (transfert?.actif && !transfert?.isExpired) ||
      procurations.some((procu) => !procu.isInactive);
  }
}
