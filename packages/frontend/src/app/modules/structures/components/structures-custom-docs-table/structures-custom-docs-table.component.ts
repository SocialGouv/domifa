import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { saveAs } from "file-saver";

import { StructureDoc } from "../../../../../_common/model";
import { StructureDocService } from "../../services/structure-doc.service";
import { Subscription } from "rxjs";
import { UserStructure } from "@domifa/common";

@Component({
  selector: "app-structures-custom-docs-table",
  templateUrl: "./structures-custom-docs-table.component.html",
})
export class StructuresCustomDocsTableComponent implements OnDestroy {
  @Input() public structureDocs!: StructureDoc[];
  @Input() public me!: UserStructure;
  @Input() public title!: string;

  @Output()
  public getAllStructureDocs = new EventEmitter<void>();

  private subscription = new Subscription();
  // Frontend variables
  public loadings: {
    download: string[];
    delete: string[];
  };

  constructor(
    private readonly structureDocService: StructureDocService,
    private readonly toastService: CustomToastService
  ) {
    this.loadings = {
      download: [],
      delete: [],
    };
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.download.push(structureDoc.uuid);

    this.subscription.add(
      this.structureDocService.getStructureDoc(structureDoc.uuid).subscribe({
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
      })
    );
  }

  public deleteStructureDoc(structureDoc: StructureDoc): void {
    this.loadings.delete.push(structureDoc.uuid);

    this.subscription.add(
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
      })
    );
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
