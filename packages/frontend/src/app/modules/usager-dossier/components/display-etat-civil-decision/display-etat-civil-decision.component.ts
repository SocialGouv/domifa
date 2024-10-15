import { Component, Input, OnInit } from "@angular/core";

import { LIEN_PARENTE_LABELS } from "@domifa/common";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { languagesAutocomplete } from "../../../usager-shared/utils/languages";

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
