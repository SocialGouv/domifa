import { Component, Input } from "@angular/core";

import { AuthService } from "../../../shared/services";
import { UserStructure } from "@domifa/common";
import { UsagerFormModel } from "../../../usager-shared/interfaces";

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
