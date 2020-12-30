import { Component, Input, OnInit } from "@angular/core";
import { Usager } from "../../../interfaces/usager";
import * as usagersLabels from "../../../usagers.labels";
@Component({
  selector: "app-profil-entretien",
  templateUrl: "./profil-entretien.component.html",
  styleUrls: ["./profil-entretien.component.css"],
})
export class ProfilEntretienComponent implements OnInit {
  @Input() public usager: Usager;
  public labels = usagersLabels;

  constructor() {}
  public ngOnInit() {}
}
