import { Component, Input } from "@angular/core";

import {
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_CAUSE_INSTABILITE,
} from "../../../../../_common/model/usager/_constants";
import { UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-display-entretien",
  templateUrl: "./display-entretien.component.html",
})
export class DisplayEntretienComponent {
  @Input() public usager!: UsagerFormModel;

  public ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;
  public ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;
  public ENTRETIEN_RAISON_DEMANDE = ENTRETIEN_RAISON_DEMANDE;
  public ENTRETIEN_TYPE_MENAGE = ENTRETIEN_TYPE_MENAGE;
  public ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;
}
