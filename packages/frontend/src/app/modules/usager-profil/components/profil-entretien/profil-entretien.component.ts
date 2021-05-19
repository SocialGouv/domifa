import { Component, Input, OnInit } from "@angular/core";
import { UsagerLight } from "../../../../../../_common/model";
import {
  ENTRETIEN_CAUSE,
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_TYPE_MENAGE,
} from "../../../../../../_common/model/usager/constants";

@Component({
  selector: "app-profil-entretien",
  templateUrl: "./profil-entretien.component.html",
  styleUrls: ["./profil-entretien.component.css"],
})
export class ProfilEntretienComponent implements OnInit {
  @Input() public usager: UsagerLight;

  public ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;
  public ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;
  public ENTRETIEN_RAISON_DEMANDE = ENTRETIEN_RAISON_DEMANDE;
  public ENTRETIEN_TYPE_MENAGE = ENTRETIEN_TYPE_MENAGE;
  public ENTRETIEN_CAUSE = ENTRETIEN_CAUSE;

  constructor() {}

  public ngOnInit() {}
}
