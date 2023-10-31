import { UsagerFormModel } from "../../../../usager-shared/interfaces/UsagerFormModel";
import { Component, Input, OnInit } from "@angular/core";
import { languagesAutocomplete } from "../../../../../shared";
import { LIEN_PARENTE_LABELS } from "@domifa/common";

@Component({
  selector: "app-display-etat-civil",
  templateUrl: "./display-etat-civil.component.html",
})
export class DisplayEtatCivilComponent implements OnInit {
  @Input() public usager!: UsagerFormModel;
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;

  public langue = "";

  ngOnInit(): void {
    this.langue = languagesAutocomplete.formatter(this.usager.langue);
  }
}
