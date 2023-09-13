import { Component, Input } from "@angular/core";
import {
  ENTRETIEN_LIEN_COMMUNE,
  ENTRETIEN_RESIDENCE,
  ENTRETIEN_RAISON_DEMANDE,
  ENTRETIEN_TYPE_MENAGE,
  ENTRETIEN_CAUSE_INSTABILITE,
} from "@domifa/common";
import { UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-display-entretien",
  templateUrl: "./display-entretien.component.html",
})
export class DisplayEntretienComponent {
  @Input() public usager!: UsagerFormModel;

  public readonly ENTRETIEN_LIEN_COMMUNE = ENTRETIEN_LIEN_COMMUNE;
  public readonly ENTRETIEN_RESIDENCE = ENTRETIEN_RESIDENCE;
  public readonly ENTRETIEN_RAISON_DEMANDE = ENTRETIEN_RAISON_DEMANDE;
  public readonly ENTRETIEN_TYPE_MENAGE = ENTRETIEN_TYPE_MENAGE;
  public readonly ENTRETIEN_CAUSE_INSTABILITE = ENTRETIEN_CAUSE_INSTABILITE;
}
