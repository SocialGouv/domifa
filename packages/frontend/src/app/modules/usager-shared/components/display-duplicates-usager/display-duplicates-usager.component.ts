import { fadeInOut } from "../../../../shared";
import { UsagerLight } from "./../../../../../_common/model/usager/UsagerLight.type";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-display-duplicates-usager",
  templateUrl: "./display-duplicates-usager.component.html",
  styleUrls: ["./display-duplicates-usager.component.css"],
  animations: [fadeInOut],
})
export class DisplayDuplicatesUsagerComponent {
  @Input({ required: true }) public duplicates: UsagerLight[];
  constructor() {
    this.duplicates = [];
  }
}
