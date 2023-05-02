import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../interfaces";

@Component({
  selector: "app-display-ayants-droits",
  templateUrl: "./display-ayants-droits.component.html",
  styleUrls: ["./display-ayants-droits.component.css"],
})
export class DisplayAyantsDroitsComponent {
  @Input() public usager: UsagerFormModel;
}
