import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { UserStructure } from "../../../../../../_common/model";

@Component({
  selector: "app-display-contact-details",
  templateUrl: "./display-contact-details.component.html",
  styleUrls: ["./display-contact-details.component.css"],
})
export class DisplayContactDetailsComponent {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure | null;
}
