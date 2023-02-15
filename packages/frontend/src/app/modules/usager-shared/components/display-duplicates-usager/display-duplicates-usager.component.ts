import { UsagerLight } from "./../../../../../_common/model/usager/UsagerLight.type";
import { Component, Input } from "@angular/core";

@Component({
  selector: "app-display-duplicates-usager",
  templateUrl: "./display-duplicates-usager.component.html",
  styleUrls: ["./display-duplicates-usager.component.css"],
})
export class DisplayDuplicatesUsagerComponent {
  @Input() public duplicates: UsagerLight[];
  constructor() {
    this.duplicates = [];
  }
}
