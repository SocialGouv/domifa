import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { saveAs } from "file-saver";

import { StructureDocService } from "../../services/structure-doc.service";
import { Subscription } from "rxjs";
import { StructureDoc, UserStructure, WithLoading } from "@domifa/common";
import { UsagersFilterCriteriaSortValues } from "../../../manage-usagers/components/usager-filter";

@Component({
  selector: "app-structures-custom-docs-table",
  templateUrl: "./structures-custom-docs-table.component.html",
})
export class StructuresCustomDocsTableComponent implements OnDestroy {
  @Input() public structureDocs!: WithLoading<StructureDoc>[];
  @Input() public me!: UserStructure;
  @Input() public title!: string;

  @Output()
  public readonly getAllStructureDocs = new EventEmitter<void>();

  public sortValue: UsagersFilterCriteriaSortValues = "desc";
  public currentKey: keyof StructureDoc = "createdAt";

  private subscription = new Subscription();

  constructor(
    private readonly structureDocService: StructureDocService,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  public getStructureDoc(structureDoc: WithLoading<StructureDoc>): void {
    structureDoc.loading = true;
    this.subscription.add(
      this.structureDocService.getStructureDoc(structureDoc.uuid).subscribe({
        next: (blob: Blob) => {
          const extension = structureDoc.path.split(".")[1];
          const newBlob = new Blob([blob], { type: structureDoc.filetype });
          saveAs(newBlob, `${structureDoc.label}.${extension}`);
          structureDoc.loading = false;
        },
        error: () => {
          this.toastService.error("Impossible de télécharger le fichier");
          structureDoc.loading = false;
        },
      })
    );
  }

  public deleteStructureDoc(structureDoc: WithLoading<StructureDoc>): void {
    structureDoc.loading = true;
    this.subscription.add(
      this.structureDocService.deleteStructureDoc(structureDoc.uuid).subscribe({
        next: () => {
          structureDoc.loading = false;
          this.toastService.success("Suppression du document réussie");
          this.getAllStructureDocs.emit();
        },
        error: () => {
          structureDoc.loading = false;
          this.toastService.error("Impossible de télécharger le fichier");
        },
      })
    );
  }
}
