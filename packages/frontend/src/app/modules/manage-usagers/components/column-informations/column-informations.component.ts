import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-column-informations",
  templateUrl: "./column-informations.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnInformationsComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
}
