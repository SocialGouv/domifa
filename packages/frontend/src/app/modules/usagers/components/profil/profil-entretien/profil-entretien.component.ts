import { Component, Input, OnInit } from "@angular/core";
import { UsagerLight } from "../../../../../../_common/model";
import * as usagersLabels from "../../../usagers.labels";
@Component({
  selector: "app-profil-entretien",
  templateUrl: "./profil-entretien.component.html",
  styleUrls: ["./profil-entretien.component.css"],
})
export class ProfilEntretienComponent implements OnInit {
  @Input() public usager: UsagerLight;
  public labels = usagersLabels;

  constructor() {}
  public ngOnInit() {}
}
