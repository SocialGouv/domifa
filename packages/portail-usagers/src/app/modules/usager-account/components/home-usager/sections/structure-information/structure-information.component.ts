import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  STRUCTURE_INFORMATION_TYPES,
  StructureInformation,
  StructureInformationType,
} from "@domifa/common";
import { ReplaceLineBreaks } from "../../../../../shared/pipes/nl2br.pipe";

@Component({
  selector: "app-structure-information",
  templateUrl: "./structure-information.component.html",
  imports: [CommonModule, ReplaceLineBreaks],
})
export class StructureInformationComponent {
  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;

  // Message type as visible text (RGAA 10.2 / 3.1), without the leading emoji
  // of the shared labels, which screen readers would read out
  public readonly TYPE_LABELS = Object.fromEntries(
    Object.entries(STRUCTURE_INFORMATION_TYPES).map(([type, { label }]) => [
      type,
      label.replace(/^\p{Extended_Pictographic}️?\s*/u, ""),
    ])
  ) as Record<StructureInformationType, string>;

  @Input() structureInformation: StructureInformation[] = [];
}
