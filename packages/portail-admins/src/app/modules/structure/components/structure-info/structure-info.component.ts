import { Component, Input } from "@angular/core";
import {
  STRUCTURE_ORGANISME_TYPE_LABELS,
  STRUCTURE_TYPE_LABELS,
  StructureCommon,
} from "@domifa/common";

@Component({
  selector: "app-structure-info",
  templateUrl: "./structure-info.component.html",
  styleUrl: "./structure-info.component.css",
})
export class StructureInfoComponent {
  @Input({ required: true }) public structure: StructureCommon;
  public readonly STRUCTURE_TYPE_LABELS = STRUCTURE_TYPE_LABELS;
  public readonly STRUCTURE_ORGANISME_TYPE_LABELS =
    STRUCTURE_ORGANISME_TYPE_LABELS;
}
