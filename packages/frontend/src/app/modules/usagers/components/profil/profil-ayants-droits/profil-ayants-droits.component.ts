import { Component, Input } from "@angular/core";
import { UsagerAyantDroit } from "../../../../../../_common/model/usager/UsagerAyantDroit.type";

@Component({
  selector: "app-profil-ayants-droits",
  templateUrl: "./profil-ayants-droits.component.html",
  styleUrls: ["./profil-ayants-droits.component.css"],
})
export class ProfilAyantsDroitsComponent {
  @Input() public ayantsDroits: UsagerAyantDroit[];
  constructor() {}
}
