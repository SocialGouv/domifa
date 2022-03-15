import { Component, OnInit, Input, OnChanges } from "@angular/core";

import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";

@Component({
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.css"],
})
export class StepHeaderComponent implements OnInit, OnChanges {
  @Input() public usager!: UsagerFormModel;

  public filteredNotes: number;

  constructor() {
    this.usager = null;
    this.filteredNotes = 0;
  }

  public ngOnInit(): void {}

  public ngOnChanges() {
    this.filteredNotes = this.usager.notes.filter(
      (note) => !note.archived
    ).length;
  }

  public navigateToNotes(): void {
    const element = document.getElementById("private_notes");
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "nearest",
    });
  }
}
