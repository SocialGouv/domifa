import { Component, OnInit, Input, OnChanges } from "@angular/core";

import { UsagerFormModel } from "../../../usager-shared/interfaces/UsagerFormModel";
import { fadeInOut } from "src/app/shared/animations";
import { UsagerLight } from "src/_common/model";

@Component({
  animations: [fadeInOut],
  selector: "app-step-header",
  templateUrl: "./step-header.component.html",
  styleUrls: ["./step-header.component.css"],
})
export class StepHeaderComponent implements OnInit, OnChanges {
  @Input() public usager!: UsagerFormModel;

  public title: string;
  public filteredNotes: number;

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges() {
    const typeDomTtile =
      this.usager.typeDom === "PREMIERE_DOM"
        ? "Première demande"
        : "Renouvellement de";
    this.title = `${typeDomTtile} ${this.usager.nom} ${this.usager.prenom} ${
      this.usager.customRef || this.usager.ref
    }`;

    this.filteredNotes = this.usager.notes.filter(
      (note) => !note.archived
    ).length;
  }
}
