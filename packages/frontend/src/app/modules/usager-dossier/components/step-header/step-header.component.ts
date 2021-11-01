import { Component, OnInit, Input, OnChanges } from "@angular/core";

import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";
import { fadeInOut } from "src/app/shared/animations";

@Component({
  animations: [fadeInOut],
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.css"],
})
export class StepHeaderComponent implements OnInit, OnChanges {
  @Input() public usager!: UsagerFormModel;

  public filteredNotes: number;

  constructor() {
    this.filteredNotes = 0;
  }

  ngOnInit(): void {}

  ngOnChanges() {
    this.filteredNotes = this.usager.notes.filter(
      (note) => !note.archived
    ).length;
  }
}
