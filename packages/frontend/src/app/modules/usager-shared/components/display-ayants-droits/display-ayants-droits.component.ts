import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../interfaces";
import { LIEN_PARENTE_LABELS } from "@domifa/common";
import { DatePipe } from "@angular/common";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-display-ayants-droits",
  templateUrl: "./display-ayants-droits.component.html",
  imports: [DsfrTooltipDirective, DatePipe],
})
export class DisplayAyantsDroitsComponent {
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
  @Input({ required: true }) public usager!: UsagerFormModel;

  private readonly datePipe = new DatePipe("fr-FR");

  get ayantsDroitsTooltip(): string {
    return this.usager.ayantsDroits
      .map(
        (ad) =>
          `👤 <strong>${ad.nom}</strong> ${
            ad.prenom
          }, né(e) le ${this.datePipe.transform(
            ad.dateNaissance,
            "dd MMMM yyyy"
          )} (${this.LIEN_PARENTE_LABELS[ad.lien]})`
      )
      .join("<br>");
  }
}
