import { UsagerFormModel } from "../../interfaces/UsagerFormModel";
import { Component, Input, OnInit } from "@angular/core";
import { LIEN_PARENTE_LABELS } from "@domifa/common";
import { languagesAutocomplete } from "../../utils/languages";

@Component({
  selector: "app-display-etat-civil",
  templateUrl: "./display-etat-civil.component.html",
})
export class DisplayEtatCivilComponent implements OnInit {
  @Input({ required: true }) public usager!: UsagerFormModel;
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  public langue = "";

  ngOnInit(): void {
    this.langue = languagesAutocomplete.formatter(this.usager.langue);
  }
}
