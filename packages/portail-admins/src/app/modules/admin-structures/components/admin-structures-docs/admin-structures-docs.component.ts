import { Component, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import {
  STRUCTURE_DOC_ICONS,
  StructureDoc,
} from "../../../../../_common/structure-doc";
import { StructuresCustomDocsService } from "../../services/structures-custom-docs.service";
import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-admin-structures-docs",
  templateUrl: "./admin-structures-docs.component.html",
  styleUrls: ["./admin-structures-docs.component.css"],
})
export class AdminStructuresDocsComponent implements OnInit {
  public readonly STRUCTURE_DOC_ICONS = STRUCTURE_DOC_ICONS;
  public structureDocs: StructureDoc[];
  // Frontend variables
  public loadings: {
    download: string[];
    delete: string[];
  };

  constructor(
    private readonly structureDocService: StructuresCustomDocsService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.loadings = {
      download: [],
      delete: [],
    };
    this.titleService.setTitle("Documents des structures");
    this.structureDocs = [];
  }

  ngOnInit(): void {
    this.structureDocService.getAllStructureDocs().subscribe({
      next: (structureDocs: StructureDoc[]) => {
        this.structureDocs = structureDocs;
      },
      error: () => {
        this.toastService.error("Impossible de télécharger le fichier");
      },
    });
  }

  public getStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.download.push(structureDoc.uuid);
    this.structureDocService
      .getStructureDoc(structureDoc.structureId, structureDoc.uuid)
      .subscribe({
        next: (blob: Blob) => {
          const extension = structureDoc.path.split(".")[1];
          const newBlob = new Blob([blob], { type: structureDoc.filetype });
          saveAs(newBlob, structureDoc.label + "." + extension);
          this.stopLoading("download", structureDoc.uuid);
        },
        error: () => {
          this.toastService.error("Impossible de télécharger le fichier");
          this.stopLoading("download", structureDoc.uuid);
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
