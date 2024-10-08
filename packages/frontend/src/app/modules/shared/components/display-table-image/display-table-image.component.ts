import { Component, Input } from "@angular/core";
import {
  STRUCTURE_DOC_EXTENSIONS_LABELS,
  STRUCTURE_DOC_ICONS,
  StructureDoc,
} from "../../../../../_common/model";
import { UsagerDoc } from "@domifa/common";

@Component({
  selector: "app-display-table-image",
  templateUrl: "./display-table-image.component.html",
})
export class DisplayTableImageComponent {
  @Input() public document!: UsagerDoc | StructureDoc;
  public readonly STRUCTURE_DOC_EXTENSIONS_LABELS =
    STRUCTURE_DOC_EXTENSIONS_LABELS;
  public readonly STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;
}
