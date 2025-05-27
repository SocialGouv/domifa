import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { DocumentService } from "../../../../usager-shared/services/document.service";
import { CustomToastService } from "../../../../shared/services/custom-toast.service";
import { Subscription } from "rxjs";
import {
  STRUCTURE_CUSTOM_DOC_LABELS,
  StructureCustomDocType,
  StructureDoc,
  StructureDocTypesAvailable,
  UserStructure,
  initLoadingState,
  WithLoading,
  SortValues,
  STRUCTURE_DOC_EXTENSIONS,
  DEFAULT_STRUCTURE_CUSTOM_DOC_AVAILABLE,
} from "@domifa/common";

@Component({
  selector: "app-profil-structure-docs",
  templateUrl: "./profil-structure-docs.component.html",
})
export class ProfilStructureDocsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  private subscription = new Subscription();
  public docs: WithLoading<StructureDoc>[] = [];

  public sortValue: SortValues = "desc";
  public currentKey: keyof StructureDoc = "createdAt";

  constructor(
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService
  ) {}

  public ngOnInit(): void {
    this.getAllStructureDocs();
  }

  // Documents définis par Domifa
  public getDomifaCustomDoc(structureDoc: WithLoading<StructureDoc>): void {
    this.subscription.add(
      this.documentService
        .getDomifaCustomDoc({
          usagerId: this.usager.ref,
          docType: structureDoc.customDocType as StructureDocTypesAvailable,
        })
        .subscribe({
          next: (blob: Blob) => {
            const newBlob = new Blob([blob], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            saveAs(newBlob, `${structureDoc.customDocType}.docx`);
            structureDoc.loading = false;
          },
          error: () => {
            this.toastService.error(
              "Impossible de télécharger le fichier pour l'instant"
            );
            structureDoc.loading = false;
          },
        })
    );
  }

  public getStructureCustomDoc(structureDoc: WithLoading<StructureDoc>): void {
    structureDoc.loading = true;
    // id= 0 => documents par défaut de DomiFa
    if (structureDoc.id === 0) {
      this.getDomifaCustomDoc(structureDoc);
      return;
    }

    this.subscription.add(
      this.documentService
        .getStructureCustomDoc(this.usager.ref, structureDoc.uuid)
        .subscribe({
          next: (blob: Blob) => {
            const extension = STRUCTURE_DOC_EXTENSIONS[structureDoc.filetype];
            const newBlob = new Blob([blob], { type: structureDoc.filetype });

            saveAs(newBlob, structureDoc.label + extension);
            structureDoc.loading = false;
          },
          error: () => {
            this.toastService.error(
              "Impossible de télécharger le fichier pour l'instant"
            );
            structureDoc.loading = false;
          },
        })
    );
  }

  public getAllStructureDocs(): void {
    this.subscription.add(
      this.documentService.getAllStructureDocs().subscribe({
        next: (structureDocs: StructureDoc[]) => {
          this.docs = initLoadingState(structureDocs);
          DEFAULT_STRUCTURE_CUSTOM_DOC_AVAILABLE.forEach((doc) => {
            if (
              !this.docs.some((structure) => structure.customDocType === doc)
            ) {
              this.docs.push(
                this.getDefaultCustomDoc(StructureDocTypesAvailable[doc])
              );
            }
          });

          if (this.usager.decision.statut !== "RADIE") {
            this.docs = this.docs.filter(
              (doc) =>
                doc.customDocType !==
                StructureDocTypesAvailable.courrier_radiation
            );
          }

          if (!this.usager.echeanceInfos.isActif) {
            this.docs = this.docs.filter(
              (doc) =>
                doc.customDocType !==
                  StructureDocTypesAvailable.attestation_postale &&
                doc.customDocType !==
                  StructureDocTypesAvailable.cerfa_attestation
            );
          }
        },
      })
    );
  }

  private getDefaultCustomDoc(
    customDocType: StructureCustomDocType
  ): WithLoading<StructureDoc> {
    return {
      id: 0,
      createdBy: {
        id: 0,
        nom: "Domifa",
        prenom: "",
      },
      structureId: 0,
      filetype:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      custom: true,
      uuid: "xxx",
      createdAt: this.me?.structure?.createdAt,
      label: STRUCTURE_CUSTOM_DOC_LABELS[customDocType],
      customDocType,
      path: "",
      loading: false,
    };
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
