import { Component, Input } from "@angular/core";
import { StructureCommon } from "@domifa/common";

@Component({
  selector: "app-structure-info",
  templateUrl: "./structure-info.component.html",
  styleUrl: "./structure-info.component.css",
})
export class StructureInfoComponent {
  @Input({ required: true }) public structure: StructureCommon;
}
