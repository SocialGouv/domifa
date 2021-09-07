import { Component, Input, OnInit } from "@angular/core";
import { UsagerFormModel } from "../../../usagers/components/form/UsagerFormModel";

@Component({
  selector: "app-profil-historique-notes",
  templateUrl: "./profil-historique-notes.component.html",
  styleUrls: ["./profil-historique-notes.component.css"],
})
export class ProfilHistoriqueNotesComponent implements OnInit {
  @Input() public usager: UsagerFormModel;

  constructor() {}

  public ngOnInit(): void {}
}
