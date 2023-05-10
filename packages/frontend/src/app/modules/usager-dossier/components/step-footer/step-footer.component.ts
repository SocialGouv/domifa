import { Component, Input } from "@angular/core";

import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";

@Component({
  selector: "app-step-footer",
  templateUrl: "./step-footer.component.html",
  styleUrls: ["./step-footer.component.css"],
})
export class StepFooterComponent {
  @Input() public usager!: UsagerFormModel;
}
