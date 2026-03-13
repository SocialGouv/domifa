import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import { AuthService } from "../../../shared/services/auth.service";
import { StructureDocService } from "../../services/structure-doc.service";
import {
  StructureDoc,
  UserStructure,
  initLoadingState,
  WithLoading,
} from "@domifa/common";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

@Component({
  selector: "app-structures-custom-docs",
  templateUrl: "./structures-custom-docs.component.html",
})
export class StructuresCustomDocsComponent implements OnInit, OnDestroy {
  public structureDocs: WithLoading<StructureDoc>[];
  public customStructureDocs: WithLoading<StructureDoc>[];

  public me!: UserStructure | null;

  public isCustomDoc: boolean;
  private readonly subscription = new Subscription();

  @ViewChild("uploadCustomDocModal", { static: false })
  public uploadCustomDocModal!: DsfrModalComponent;

  constructor(
    private readonly authService: AuthService,
    private readonly structureDocService: StructureDocService,
    private readonly toastService: CustomToastService,
    private readonly titleService: Title
  ) {
    this.structureDocs = [];
    this.customStructureDocs = [];
    this.isCustomDoc = false;
  }

  public ngOnInit(): void {
    this.titleService.setTitle(
      "Gestion des documents de la structure - DomiFa"
    );
    this.me = this.authService.currentUserValue;
    this.getAllStructureDocs();
  }

  public getAllStructureDocs(): void {
    this.subscription.add(
      this.structureDocService.getAllStructureDocs().subscribe({
        next: (structureDocs: StructureDoc[]) => {
          this.structureDocs = initLoadingState(structureDocs).filter(
            (structureDoc) => !structureDoc.custom
          );
          this.customStructureDocs = initLoadingState(structureDocs).filter(
            (structureDoc) => structureDoc.custom
          );
        },
        error: () => {
          this.toastService.error("Impossible d'afficher les documents");
        },
      })
    );
  }

  public closeModals(): void {
    this.uploadCustomDocModal?.close();
  }

  public openUploadCustomDocModal(isCustomDoc = false): void {
    this.isCustomDoc = isCustomDoc;
    this.uploadCustomDocModal.open();
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
