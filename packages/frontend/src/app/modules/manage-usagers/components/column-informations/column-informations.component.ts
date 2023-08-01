import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-column-informations",
  templateUrl: "./column-informations.component.html",
})
export class ColumnInformationsComponent {
  @Input() public usager!: UsagerFormModel;
  public today = new Date();
}
