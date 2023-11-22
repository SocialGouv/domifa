import { Component, Input, OnInit } from "@angular/core";

import { PortailUsagerPublic, UsagerOptionsProcuration } from "@domifa/common";

@Component({
  selector: "app-section-options",
  templateUrl: "./section-options.component.html",
})
export class SectionOptionsComponent implements OnInit {
  @Input() public usager!: PortailUsagerPublic;

  public today: Date;

  constructor() {
    this.today = new Date();
  }

  ngOnInit(): void {
    if (this.usager?.options.transfert?.actif) {
      this.usager.options.transfert.dateDebut =
        this.usager.options.transfert.dateDebut &&
        this.usager.options.transfert.dateDebut !== null
          ? new Date(this.usager.options.transfert.dateDebut)
          : null;

      this.usager.options.transfert.dateFin =
        this.usager.options.transfert.dateFin &&
        this.usager.options.transfert.dateFin !== null
          ? new Date(this.usager.options.transfert.dateFin)
          : null;
    }

    if (this.usager?.options?.procurations.length > 0) {
      this.usager.options.procurations = this.usager.options.procurations.map(
        (apiProcuration: UsagerOptionsProcuration) => {
          return {
            nom: apiProcuration?.nom ?? "",
            prenom: apiProcuration?.prenom ?? "",
            dateNaissance: new Date(apiProcuration.dateNaissance),
            dateFin: new Date(apiProcuration.dateFin),
            dateDebut: new Date(apiProcuration.dateDebut),
          };
        },
      );
    }
  }
}
