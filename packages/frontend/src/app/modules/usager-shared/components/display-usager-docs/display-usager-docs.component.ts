import { STRUCTURE_DOC_EXTENSIONS } from "src/_common/model";
import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { UsagerFormModel } from "../../interfaces";
import { DocumentService } from "../../services/document.service";
import { saveAs } from "file-saver";
import { Subscription } from "rxjs";
import { UsagerDoc, UserStructure } from "@domifa/common";
import { UsagersFilterCriteriaSortValues } from "../../../manage-usagers/components/usager-filter";
import slug from "slug";
import { initializeLoadingState, WithLoading } from "../../../../shared";

@Component({
  selector: "app-display-usager-docs",
  templateUrl: "./display-usager-docs.component.html",
})
export class DisplayUsagerDocsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  @Input() public editPJ!: boolean;

  private subscription = new Subscription();
  public docs: WithLoading<UsagerDoc>[];

  public sortValue: UsagersFilterCriteriaSortValues = "desc";
  public currentKey: keyof UsagerDoc = "createdAt";

  constructor(
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService
  ) {
    this.docs = [];
  }

  public ngOnInit(): void {
    this.getUsagerDocs();
  }

  public getUsagerDocs(): void {
    this.subscription.add(
      this.documentService.getUsagerDocs(this.usager.ref).subscribe({
        next: (docs: UsagerDoc[]) => {
          this.docs = initializeLoadingState(docs);
        },
        error: () => {
          this.toastService.error("Impossible de d'afficher les documents");
        },
      })
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateDocument(updatedDoc: any, index: number) {
    this.docs = [
      ...this.docs.slice(0, index),
      updatedDoc,
      ...this.docs.slice(index + 1),
    ];
  }

  public getDocument(doc: WithLoading<UsagerDoc>) {
    doc.loading = true;
    this.subscription.add(
      this.documentService.getDocument(this.usager.ref, doc.uuid).subscribe({
        next: (blob: Blob) => {
          const extension = STRUCTURE_DOC_EXTENSIONS[doc.filetype];
          const newBlob = new Blob([blob], { type: doc.filetype });

          const label = this.slugLabel(doc.label);
          const slugName = this.slugLabel(
            `${this.usager.nom} ${this.usager.prenom}`
          );
          const name = `${label}_${slugName}${extension}`;

          saveAs(newBlob, name);
          doc.loading = false;
        },
        error: () => {
          this.toastService.error("Impossible de télécharger le fichier");
          doc.loading = false;
        },
      })
    );
  }

  public deleteDocument(doc: WithLoading<UsagerDoc>): void {
    doc.loading = true;
    this.subscription.add(
      this.documentService.deleteDocument(this.usager.ref, doc.uuid).subscribe({
        next: (docs: UsagerDoc[]) => {
          this.docs = initializeLoadingState(docs);
          this.toastService.success("Document supprimé avec succès");
        },
        error: () => {
          doc.loading = true;

          this.toastService.error("Impossible de supprimer le document");
        },
      })
    );
  }

  private slugLabel(docName: string): string {
    return slug(docName, {
      mode: "rfc3986" as const,
      lower: true,
      replacement: "-",
      locale: "fr",
      trim: true,
      remove: /[.]/g, // Supprime tous les points
    });
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
