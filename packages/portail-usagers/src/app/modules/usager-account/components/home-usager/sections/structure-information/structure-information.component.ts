import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  STRUCTURE_INFORMATION_TYPES,
  StructureInformation,
} from "@domifa/common";
import { ReplaceLineBreaks } from "../../../../../shared/pipes/nl2br.pipe";

@Component({
  selector: "app-structure-information",
  templateUrl: "./structure-information.component.html",
  imports: [CommonModule, ReplaceLineBreaks],
})
export class StructureInformationComponent {
  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;

  @Input() structureInformation: StructureInformation[] = [];
}
