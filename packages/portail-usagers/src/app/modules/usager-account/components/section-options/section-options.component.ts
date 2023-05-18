import { Component, Input, OnInit } from "@angular/core";

import {
  PortailUsagerPublic,
  UsagerOptionsProcuration,
} from "../../../../../_common";

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
          const procuration: UsagerOptionsProcuration = {
            nom: null,
            prenom: null,
            dateNaissance: null,
            dateFin: null,
            dateDebut: null,
          };

          procuration.nom = apiProcuration?.nom ?? null;
          procuration.prenom = apiProcuration?.prenom ?? null;

          if (apiProcuration.dateNaissance) {
            procuration.dateNaissance = new Date(apiProcuration.dateNaissance);
          }
          if (apiProcuration.dateFin) {
            procuration.dateFin = new Date(apiProcuration.dateFin);
          }
          if (apiProcuration.dateDebut) {
            procuration.dateDebut = new Date(apiProcuration.dateDebut);
          }
          return procuration;
        },
      );
    }
  }
}
