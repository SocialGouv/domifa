import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
} from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DisplayAyantsDroitsComponent } from "../../../usager-shared/components/display-ayants-droits/display-ayants-droits.component";
import { DatePipe, TitleCasePipe } from "@angular/common";
import { DsfrTooltipDirective } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-column-informations",
  templateUrl: "./column-informations.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ["./column-informations.component.scss"],
  imports: [
    DisplayAyantsDroitsComponent,
    DatePipe,
    TitleCasePipe,
    DsfrTooltipDirective,
  ],
})
export class ColumnInformationsComponent implements OnChanges {
  @Input({ required: true }) public usager!: UsagerFormModel;

  public procurationTooltip = "";

  private readonly datePipe = new DatePipe("fr-FR");

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes["usager"]) return;
    this.procurationTooltip = this.usager.options.procurations
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
