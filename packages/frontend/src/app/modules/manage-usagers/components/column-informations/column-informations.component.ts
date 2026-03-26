import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { DisplayAyantsDroitsComponent } from "../../../usager-shared/components/display-ayants-droits/display-ayants-droits.component";
import { DatePipe, TitleCasePipe } from "@angular/common";

@Component({
  selector: "app-column-informations",
  templateUrl: "./column-informations.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgbTooltipModule,
    DisplayAyantsDroitsComponent,
    DatePipe,
    TitleCasePipe,
  ],
  standalone: true,
})
export class ColumnInformationsComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
}
