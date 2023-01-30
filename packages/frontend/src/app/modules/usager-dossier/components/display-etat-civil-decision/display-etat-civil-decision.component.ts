import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { Component, Input } from "@angular/core";
import { LIEN_PARENTE_LABELS } from "../../../../../_common/model";
import { languagesAutocomplete } from "../../../../shared";

@Component({
  selector: "app-display-etat-civil-decision",
  templateUrl: "./display-etat-civil-decision.component.html",
})
export class DisplayEtatCivilDecisionComponent {
  @Input() public usager!: UsagerFormModel;

  public readonly languagesAutocomplete = languagesAutocomplete;
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
}
