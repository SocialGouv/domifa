import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../interfaces";
import { LIEN_PARENTE_LABELS } from "@domifa/common";

@Component({
  selector: "app-display-ayants-droits",
  templateUrl: "./display-ayants-droits.component.html",
})
export class DisplayAyantsDroitsComponent {
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
  @Input() public usager!: UsagerFormModel;
}
