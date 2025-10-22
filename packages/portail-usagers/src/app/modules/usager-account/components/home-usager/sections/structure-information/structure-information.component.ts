import { Component, Input } from "@angular/core";
import {
  STRUCTURE_INFORMATION_TYPES,
  StructureInformation,
} from "@domifa/common";

@Component({
  selector: "app-structure-information",
  templateUrl: "./structure-information.component.html",
})
export class StructureInformationComponent {
  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;

  @Input() structureInformation: StructureInformation[] = [];
}
