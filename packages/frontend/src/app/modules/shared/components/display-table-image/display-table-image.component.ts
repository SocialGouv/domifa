import { StructureDoc } from "./../../../../../_common/model/structure-doc/types/StructureDoc.type";
import { UsagerDoc } from "./../../../../../_common/model/usager/UsagerDoc.type";
import { Component, Input } from "@angular/core";
import {
  STRUCTURE_DOC_EXTENSIONS_LABELS,
  STRUCTURE_DOC_ICONS,
} from "../../../../../_common/model";

@Component({
  selector: "app-display-table-image",
  templateUrl: "./display-table-image.component.html",
  styleUrls: ["./display-table-image.component.css"],
})
export class DisplayTableImageComponent {
  @Input() public document: UsagerDoc | StructureDoc;
  public readonly STRUCTURE_DOC_EXTENSIONS_LABELS =
    STRUCTURE_DOC_EXTENSIONS_LABELS;
  public readonly STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;
}
