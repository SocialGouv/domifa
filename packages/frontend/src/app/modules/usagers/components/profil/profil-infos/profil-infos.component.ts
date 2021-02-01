import { Component, Input } from "@angular/core";
import { UsagerLight } from "../../../../../../_common/model";
import { languagesAutocomplete } from "../../../../../shared";

@Component({
  selector: "app-profil-infos",
  templateUrl: "./profil-infos.component.html",
  styleUrls: ["./profil-infos.component.css"],
})
export class ProfilInfosComponent {
  @Input() public usager: UsagerLight;

  public languagesAutocomplete = languagesAutocomplete;

  constructor() {}
}
