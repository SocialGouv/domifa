import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { UsagerDocService } from "../../../../services/usager-doc.service";
import {
  initLoadingState,
  PortailUsagerPublic,
  STRUCTURE_DOC_EXTENSIONS,
  STRUCTURE_DOC_EXTENSIONS_LABELS,
  STRUCTURE_INFORMATION_TYPES,
  UsagerDoc,
  WithLoading,
} from "@domifa/common";
import { Subscription } from "rxjs";
import { CustomToastService } from "../../../../../shared/services/custom-toast.service";
import { saveAs } from "file-saver";

@Component({
  selector: "app-section-docs",
  templateUrl: "./section-docs.component.html",
})
export class SectionDocsComponent implements OnInit, OnDestroy {
  @Input() public usager!: PortailUsagerPublic;
  public docs: WithLoading<UsagerDoc>[] = [];
  private subscription = new Subscription();

  public readonly STRUCTURE_INFORMATION_TYPES = STRUCTURE_INFORMATION_TYPES;
  public readonly STRUCTURE_DOC_EXTENSIONS_LABELS =
    STRUCTURE_DOC_EXTENSIONS_LABELS;

  constructor(
    private readonly usagerDocService: UsagerDocService,
    private readonly toastr: CustomToastService
  ) {}

  ngOnInit(): void {
    this.getDocs();
  }

  public getDocs() {
    this.subscription.add(
      this.usagerDocService.getDocuments().subscribe({
        next: (docs: UsagerDoc[]) => {
          this.docs = initLoadingState(docs);
        },
      })
    );
  }

  public downloadDoc(doc: WithLoading<UsagerDoc>) {
    doc.loading = true;
    this.subscription.add(
      this.usagerDocService.downloadDocument(doc.uuid as string).subscribe({
        next: (blob: Blob) => {
          const extension = STRUCTURE_DOC_EXTENSIONS[doc.filetype];
          const newBlob = new Blob([blob], { type: doc.filetype });

          const name = `${doc.label}${extension}`;

          saveAs(newBlob, name);
          doc.loading = false;
        },
        error: () => {
          this.toastr.error("Impossible de télécharger le fichier");
          doc.loading = false;
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
