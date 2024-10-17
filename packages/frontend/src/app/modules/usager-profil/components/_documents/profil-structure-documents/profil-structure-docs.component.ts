import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { saveAs } from "file-saver";
import { STRUCTURE_DOC_EXTENSIONS } from "../../../../../../_common/model/structure-doc";
import { UsagerFormModel } from "../../../../usager-shared/interfaces";
import { DocumentService } from "../../../../usager-shared/services/document.service";
import { CustomToastService } from "../../../../shared/services/custom-toast.service";
import { Subscription } from "rxjs";
import {
  StructureDoc,
  StructureDocTypesAvailable,
  UserStructure,
} from "@domifa/common";
import { UsagersFilterCriteriaSortValues } from "../../../../manage-usagers/components/usager-filter";

@Component({
  selector: "app-profil-structure-docs",
  templateUrl: "./profil-structure-docs.component.html",
})
export class ProfilStructureDocsComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;

  public defaultStructureDocs: {
    attestation_postale: StructureDoc;
    courrier_radiation: StructureDoc;
  };

  private subscription = new Subscription();
  public customStructureDocs: StructureDoc[];

  // Frontend variables
  public loadings: string[];

  public sortValue: UsagersFilterCriteriaSortValues = "desc";
  public currentKey: keyof StructureDoc = "createdAt";

  constructor(
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService
  ) {
    this.defaultStructureDocs = {
      attestation_postale: {
        id: 0,
        createdBy: {
          id: 0,
          nom: "Domifa",
          prenom: "",
        },
        filetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        custom: true,
        uuid: "xxx",
        createdAt: this.me?.structure?.createdAt,
        label: "Attestation postale",
        customDocType: "attestation_postale",
        path: "",
      },
      courrier_radiation: {
        id: 1,
        createdBy: {
          id: 0,
          nom: "Domifa",
          prenom: "",
        },
        filetype:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        custom: true,
        uuid: "xxx",
        createdAt: this.me?.structure?.createdAt,
        label: "Courrier de radiation",
        customDocType: "courrier_radiation",
        path: "",
      },
    };

    this.customStructureDocs = [];
    this.loadings = [];
  }

  public ngOnInit(): void {
    this.getAllStructureDocs();
  }

  // Documents définis par Domifa
  public getDomifaCustomDoc(docType: StructureDocTypesAvailable): void {
    this.loadings.push(docType);

    this.subscription.add(
      this.documentService
        .getDomifaCustomDoc({
          usagerId: this.usager.ref,
          docType,
        })
        .subscribe({
          next: (blob: Blob) => {
            const newBlob = new Blob([blob], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            saveAs(newBlob, `${docType}.docx`);
            this.stopLoading(docType);
          },
          error: () => {
            this.toastService.error(
              "Impossible de télécharger le fichier pour l'instant"
            );
            this.stopLoading(docType);
          },
        })
    );
  }

  // Documents personnalisables de la structure
  public getStructureCustomDoc(structureDoc: StructureDoc): void {
    this.subscription.add(
      this.documentService
        .getStructureCustomDoc(this.usager.ref, structureDoc.uuid)
        .subscribe({
          next: (blob: Blob) => {
            const extension = STRUCTURE_DOC_EXTENSIONS[structureDoc.filetype];
            const newBlob = new Blob([blob], { type: structureDoc.filetype });

            saveAs(newBlob, structureDoc.label + extension);
            this.stopLoading(structureDoc.uuid);
          },
          error: () => {
            this.toastService.error(
              "Impossible de télécharger le fichier pour l'instant"
            );
            this.stopLoading(structureDoc.uuid);
          },
        })
    );
  }

  public getAllStructureDocs(): void {
    this.subscription.add(
      this.documentService.getAllStructureDocs().subscribe({
        next: (structureDocs: StructureDoc[]) => {
          structureDocs.forEach((structureDoc: StructureDoc) => {
            if (structureDoc.customDocType === "attestation_postale") {
              this.defaultStructureDocs.attestation_postale.createdBy =
                structureDoc.createdBy;
              this.defaultStructureDocs.attestation_postale.createdAt =
                structureDoc.createdAt;
            } else if (structureDoc.customDocType === "courrier_radiation") {
              this.defaultStructureDocs.courrier_radiation.createdBy =
                structureDoc.createdBy;
              this.defaultStructureDocs.courrier_radiation.createdAt =
                structureDoc.createdAt;
            } else {
              this.customStructureDocs.push(structureDoc);
            }
          });
        },
      })
    );
  }

  private stopLoading(loadingRef: string): void {
    const index = this.loadings.indexOf(loadingRef);
    if (index !== -1) {
      this.loadings.splice(index, 1);
    }
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
