import { Component, Input, OnInit } from "@angular/core";
import { UsagerLight } from "../../../../../_common/model";
import {
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_CAUSE_INSTABILITE,
} from "../../../../../_common/model/usager/_constants";

@Component({
  selector: "app-display-entretien",
  templateUrl: "./display-entretien.component.html",
})
export class DisplayEntretienComponent implements OnInit {
  @Input() public usager: UsagerLight;

  public ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;
  public ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;
  public ENTRETIEN_RAISON_DEMANDE = ENTRETIEN_RAISON_DEMANDE;
  public ENTRETIEN_TYPE_MENAGE = ENTRETIEN_TYPE_MENAGE;
  public ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;

  constructor() {}

  public ngOnInit(): void {}
}
