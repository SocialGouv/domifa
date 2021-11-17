import { Component, Input, OnInit } from "@angular/core";
import { ToastrService } from "ngx-toastr";
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
export class StructuresCustomDocsTableComponent implements OnInit {
  public STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;
  @Input() public structureDocs: StructureDoc[];
  @Input() public me: UserStructure;

  // Frontend variables
  public loadings: {
    download: string[];
    delete: string[];
  };

  constructor(
    private structureDocService: StructureDocService,
    private notifService: ToastrService
  ) {
    this.loadings = {
      download: [],
      delete: [],
    };
  }

  ngOnInit(): void {}

  public getStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.download.push(structureDoc.uuid);
    this.structureDocService.getStructureDoc(structureDoc.uuid).subscribe({
      next: (blob: any) => {
        const extension = structureDoc.path.split(".")[1];
        const newBlob = new Blob([blob], { type: structureDoc.filetype });
        saveAs(newBlob, structureDoc.label + "." + extension);
        this.stopLoading("download", structureDoc.uuid);
      },
      error: () => {
        this.notifService.error("Impossible de télécharger le fichier");
        this.stopLoading("download", structureDoc.uuid);
      },
    });
  }

  public deleteStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.delete.push(structureDoc.uuid);
    this.structureDocService.deleteStructureDoc(structureDoc.uuid).subscribe({
      next: () => {
        this.stopLoading("delete", structureDoc.uuid);
        this.notifService.success("Suppression réussie");
      },
      error: () => {
        this.stopLoading("delete", structureDoc.uuid);
        this.notifService.error("Impossible de télécharger le fichier");
      },
    });
  }

  private stopLoading(loadingType: "delete" | "download", loadingRef: string) {
    var index = this.loadings[loadingType].indexOf(loadingRef);
    if (index !== -1) {
      this.loadings[loadingType].splice(index, 1);
    }
  }
}
