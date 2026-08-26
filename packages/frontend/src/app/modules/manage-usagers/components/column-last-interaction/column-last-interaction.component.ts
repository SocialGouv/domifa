import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { DatePipe } from "@angular/common";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-column-last-interaction",
  templateUrl: "./column-last-interaction.component.html",
  styleUrls: ["./column-last-interaction.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
})
export class ColumnLastInteractionComponent {
  @Input({ required: true }) public usager!: UsagerFormModel;
}
