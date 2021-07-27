import { Component, Input, OnInit } from "@angular/core";
import { UsagerLight } from "../../../../../../_common/model";
import { ENTRETIEN_LIEN_COMMUNE } from "../../../../../../_common/model/usager/constants";
import * as usagersLabels from "../../../usagers.labels";
@Component({
  selector: "app-profil-entretien",
  templateUrl: "./profil-entretien.component.html",
  styleUrls: ["./profil-entretien.component.css"],
})
export class ProfilEntretienComponent implements OnInit {
  @Input() public usager: UsagerLight;
  public labels = usagersLabels;
  public ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;

  constructor() {}
  public ngOnInit() {}
}
