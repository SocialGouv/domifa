import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DisplayAyantsDroitsComponent } from "../../../usager-shared/components/display-ayants-droits/display-ayants-droits.component";
import { DatePipe, TitleCasePipe } from "@angular/common";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-column-informations",
  templateUrl: "./column-informations.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DisplayAyantsDroitsComponent,
    DatePipe,
    TitleCasePipe,
    DsfrTooltipDirective,
  ],
})
export class ColumnInformationsComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;

  private readonly datePipe = new DatePipe("fr-FR");

  get procurationTooltip(): string {
    return this.usager.options.procurations
      .map((p) => {
        if (!p.isExpired) {
          return `✅ Active : ${p.nom} ${p.prenom}`;
        }
        return `❌ ${p.nom} ${p.prenom}, expirée le ${this.datePipe.transform(
          p.dateFin,
          "dd MMMM yyyy"
        )}`;
      })
      .join("<br>");
  }
}
