import { Component, Input } from "@angular/core";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

@Component({
  selector: "app-display-contact-details-decision",
  templateUrl: "./display-contact-details-decision.component.html",
})
export class DisplayContactDetailsDecisionComponent {
  @Input() public usager!: UsagerFormModel;
}
