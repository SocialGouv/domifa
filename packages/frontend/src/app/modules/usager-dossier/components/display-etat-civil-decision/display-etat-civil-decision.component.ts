import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { Component, Input, OnInit } from "@angular/core";

import { languagesAutocomplete } from "../../../../shared";
import { LIEN_PARENTE_LABELS } from "@domifa/common";

@Component({
  selector: "app-display-etat-civil-decision",
  templateUrl: "./display-etat-civil-decision.component.html",
})
export class DisplayEtatCivilDecisionComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  @Input() public section!: "ETAT_CIVIL" | "AYANTS_DROIT";

  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
  public langue = "";

  ngOnInit(): void {
    this.langue = languagesAutocomplete.formatter(this.usager.langue);
  }
}
