import { Component, Input, OnInit } from "@angular/core";

import {
  PortailUsagerPublic,
  UsagerOptionsProcuration,
  OptionsTransfert,
  UsagerProcuration,
} from "@domifa/common";

@Component({
  selector: "app-section-options",
  templateUrl: "./section-options.component.html",
})
export class SectionOptionsComponent implements OnInit {
  @Input({ required: true }) public usager!: PortailUsagerPublic;

  public today = new Date();

  ngOnInit(): void {
    this.usager.options.transfert = new OptionsTransfert(
      this.usager?.options.transfert,
    );

    if (this.usager?.options?.procurations?.length) {
      this.usager.options.procurations = this.usager?.options.procurations.map(
        (apiProcuration: UsagerOptionsProcuration) =>
          new UsagerProcuration(apiProcuration),
      );
    }
  }
}
