import { Component, Input } from "@angular/core";
import { Usager } from "../../../interfaces/usager";

import { languagesAutocomplete } from "../../../../../shared";
@Component({
  selector: "app-profil-infos",
  templateUrl: "./profil-infos.component.html",
  styleUrls: ["./profil-infos.component.css"],
})
export class ProfilInfosComponent {
  @Input() public usager: Usager;

  public languagesAutocomplete = languagesAutocomplete;

  constructor() {}
}
