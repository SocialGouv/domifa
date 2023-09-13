import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { Component, Input } from "@angular/core";

import { languagesAutocomplete } from "../../../../shared";
import { LIEN_PARENTE_LABELS } from "@domifa/common";

@Component({
  selector: "app-display-etat-civil-decision",
  templateUrl: "./display-etat-civil-decision.component.html",
})
export class DisplayEtatCivilDecisionComponent {
  @Input() public usager!: UsagerFormModel;
  @Input() public section!: "ETAT_CIVIL" | "AYANTS_DROIT";

  public readonly languagesAutocomplete = languagesAutocomplete;
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
}
