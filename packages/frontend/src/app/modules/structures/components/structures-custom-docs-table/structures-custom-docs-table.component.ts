import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import fileSaver from "file-saver";

import {
  StructureDoc,
  STRUCTURE_DOC_ICONS,
  UserStructure,
} from "../../../../../_common/model";
import { StructureDocService } from "../../services/structure-doc.service";

@Component({
  selector: "app-structures-custom-docs-table",
  templateUrl: "./structures-custom-docs-table.component.html",
  styleUrls: ["./structures-custom-docs-table.component.css"],
})
export class StructuresCustomDocsTableComponent {
  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;

  @Input() public structureDocs: StructureDoc[];
  @Input() public me: UserStructure;
  @Input() public title: string;

  @Output()
  public getAllStructureDocs = new EventEmitter<void>();

  // Frontend variables
  public loadings: {
    download: string[];
    delete: string[];
  };

  constructor(
    private structureDocService: StructureDocService,
    private toastService: CustomToastService
  ) {
    this.loadings = {
      download: [],
      delete: [],
    };
  }

  public getStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.download.push(structureDoc.uuid);
    this.structureDocService.getStructureDoc(structureDoc.uuid).subscribe({
      next: (blob: Blob) => {
        const extension = structureDoc.path.split(".")[1];
        const newBlob = new Blob([blob], { type: structureDoc.filetype });
        fileSaver.saveAs(newBlob, structureDoc.label + "." + extension);
        this.stopLoading("download", structureDoc.uuid);
      },
      error: () => {
        this.toastService.error("Impossible de télécharger le fichier");
        this.stopLoading("download", structureDoc.uuid);
      },
    });
  }

  public deleteStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.delete.push(structureDoc.uuid);
    this.structureDocService.deleteStructureDoc(structureDoc.uuid).subscribe({
      next: () => {
        this.stopLoading("delete", structureDoc.uuid);
        this.toastService.success("Suppression réussie");

        this.getAllStructureDocs.emit();
      },
      error: () => {
        this.stopLoading("delete", structureDoc.uuid);
        this.toastService.error("Impossible de télécharger le fichier");
      },
    });
  }

  private stopLoading(loadingType: "delete" | "download", loadingRef: string) {
    setTimeout(() => {
      const index = this.loadings[loadingType].indexOf(loadingRef);
      if (index !== -1) {
        this.loadings[loadingType].splice(index, 1);
      }
    }, 500);
  }
}
