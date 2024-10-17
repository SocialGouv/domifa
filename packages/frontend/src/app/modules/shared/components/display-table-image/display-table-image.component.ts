import { Component, Input } from "@angular/core";

import { StructureDoc, UsagerDoc } from "@domifa/common";
import { JsonPipe, NgClass } from "@angular/common";

import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faFileWord,
  faImage,
  faFileExcel,
  faFilePdf,
} from "@fortawesome/free-regular-svg-icons";

@Component({
  selector: "app-display-table-image",
  templateUrl: "./display-table-image.component.html",
  standalone: true,
  imports: [FontAwesomeModule, NgClass, JsonPipe],
  styleUrl: "./display-table-image.component.scss",
})
export class DisplayTableImageComponent {
  @Input() public document!: UsagerDoc | StructureDoc;
  public readonly STRUCTURE_DOC_EXTENSIONS_LABELS: {
    [key: string]: string;
  } = {
    "image/jpg": "Document au format Image JPEG",
    "image/jpeg": "Document au format Image JPEG",
    "image/png": "Document au format Image PNG",
    "application/pdf": "Document au format PDF",
    "application/msword": "Document au format Docx",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Document au format Docx",
    "application/vnd.oasis.opendocument.text": "Document au format Docx",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "Feuille de calcul",
    "application/vnd.ms-excel": "Feuille de calcul Excel",
  };

  public readonly STRUCTURE_DOC_ICONS: {
    [key: string]: IconDefinition;
  } = {
    "image/jpg": faImage,
    "image/jpeg": faImage,
    "image/png": faImage,
    "application/pdf": faFilePdf,
    "application/msword": faFileWord,
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      faFileWord,
    "application/vnd.oasis.opendocument.text": faFileWord,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      faFileExcel,
    "application/vnd.ms-excel": faFileExcel,
  };
}
