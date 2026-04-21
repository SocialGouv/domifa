import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
} from "@angular/core";
import { UsagerFormModel } from "../../interfaces";
import { LIEN_PARENTE_LABELS } from "@domifa/common";
import { DatePipe } from "@angular/common";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-display-ayants-droits",
  templateUrl: "./display-ayants-droits.component.html",
  imports: [DsfrTooltipDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DisplayAyantsDroitsComponent implements OnChanges {
  public readonly LIEN_PARENTE_LABELS = LIEN_PARENTE_LABELS;
  @Input({ required: true }) public usager!: UsagerFormModel;

  public ayantsDroitsTooltip = "";

  private readonly datePipe = new DatePipe("fr-FR");

  ngOnChanges(): void {
    this.ayantsDroitsTooltip = this.usager.ayantsDroits
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
