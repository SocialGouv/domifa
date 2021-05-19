import { Component, Input, OnInit } from "@angular/core";
import { UsagerLight } from "../../../../../_common/model";
import * as USAGERS_LABELS from "../../../../shared/constants/USAGER_LABELS.const";

@Component({
  selector: "app-profil-entretien",
  templateUrl: "./profil-entretien.component.html",
  styleUrls: ["./profil-entretien.component.css"],
})
export class ProfilEntretienComponent implements OnInit {
  @Input() public usager: UsagerLight;
  public labels = USAGERS_LABELS;

  constructor() {}
  public ngOnInit() {}
}
