import { Component, Input } from "@angular/core";

import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";

@Component({
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.css"],
})
export class StepHeaderComponent {
  @Input() public usager!: UsagerFormModel;

  public filteredNotes: number;

  constructor() {
    this.filteredNotes = 0;
  }

  public navigateToNotes(): void {
    const element = document.getElementById("private_notes");
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }
}
