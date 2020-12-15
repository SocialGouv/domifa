import { Component, Input } from "@angular/core";
import { Usager } from "../../../interfaces/usager";

@Component({
  selector: "app-profil-ayants-droits",
  templateUrl: "./profil-ayants-droits.component.html",
  styleUrls: ["./profil-ayants-droits.component.css"],
})
export class ProfilAyantsDroitsComponent {
  @Input() public usager: Usager;
  constructor() {}
}
