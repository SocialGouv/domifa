import { UsagerFormModel } from "../../interfaces/UsagerFormModel";
import { Component, Input } from "@angular/core";
import { LIEN_PARENTE_LABELS } from "@domifa/common";

@Component({
  selector: "app-display-etat-civil",
  templateUrl: "./display-etat-civil.component.html",
})
export class DisplayEtatCivilComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
}
