import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-profil-historique-notes",
  templateUrl: "./profil-historique-notes.component.html",
  styleUrls: ["./profil-historique-notes.component.css"],
})
export class ProfilHistoriqueNotesComponent {
  @Input() public usager: UsagerFormModel;
}
