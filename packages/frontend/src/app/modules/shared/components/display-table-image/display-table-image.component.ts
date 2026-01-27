import { Component, Input } from "@angular/core";

import { StructureDoc, UsagerDoc } from "@domifa/common";

@Component({
  selector: "app-display-table-image",
  templateUrl: "./display-table-image.component.html",
  standalone: true,
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
    [key: string]: string;
  } = {
    "image/jpg": "image",
    "image/jpeg": "image",
    "image/png": "image",
    "application/pdf": "pdf",
    "application/msword": "word",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "word",
    "application/vnd.oasis.opendocument.text": "word",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
      "excel",
    "application/vnd.ms-excel": "excel",
  };
}
