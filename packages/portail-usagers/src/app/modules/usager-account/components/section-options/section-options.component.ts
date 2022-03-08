import { Component, Input, OnInit } from "@angular/core";
import { format } from "date-fns";

import { PortailUsagerPublic } from "../../../../../_common";

@Component({
  selector: "app-section-options",
  templateUrl: "./section-options.component.html",
  styleUrls: ["./section-options.component.css"],
})
export class SectionOptionsComponent implements OnInit {
  @Input() public usager!: PortailUsagerPublic;
  public transfertDateFin: string = "";

  constructor() {}

  ngOnInit(): void {
    console.log(this.usager.options);
    if (
      this.usager.options.transfert.actif &&
      this.usager.options.transfert.dateFin
    ) {
      this.transfertDateFin = format(
        new Date(this.usager.options.transfert.dateFin),
        "dd/MM/y"
      );
    }
  }
}
