import { Component, Input } from "@angular/core";

import { UsagerFormModel } from "./../../../usager-shared/interfaces/UsagerFormModel";
import { UserStructure } from "../../../../../_common/model";
import { AuthService } from "../../../shared/services";

@Component({
  selector: "app-step-footer",
  templateUrl: "./step-footer.component.html",
})
export class StepFooterComponent {
  @Input() public usager!: UsagerFormModel;

  public me!: UserStructure | null;

  constructor(private readonly authService: AuthService) {
    this.me = this.authService.currentUserValue;
  }
}
