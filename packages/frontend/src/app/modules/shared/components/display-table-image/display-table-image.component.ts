import { Component, Input } from "@angular/core";

import {
  STRUCTURE_DOC_EXTENSIONS_LABELS,
  StructureDoc,
  UsagerDoc,
} from "@domifa/common";
import { STRUCTURE_DOC_ICONS } from "./STRUCTURE_DOC_ICONS.const";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgClass } from "@angular/common";

@Component({
  selector: "app-display-table-image",
  templateUrl: "./display-table-image.component.html",
  standalone: true,
  imports: [FontAwesomeModule, NgClass],
})
export class DisplayTableImageComponent {
  @Input() public document!: UsagerDoc | StructureDoc;
  public readonly STRUCTURE_DOC_EXTENSIONS_LABELS =
    STRUCTURE_DOC_EXTENSIONS_LABELS;
  public readonly STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;
}
