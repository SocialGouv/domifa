import { AuthService } from "src/app/modules/shared/services/auth.service";
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
} from "@angular/core";
import saveAs from "file-saver";
import { Subscription } from "rxjs";
import { StructureDocTypesAvailable } from "../../../../../_common/model";
import { CustomToastService } from "../../../shared/services";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { UserStructure, CerfaDocType } from "@domifa/common";

@Component({
  selector: "app-manage-download-docs",
  templateUrl: "./manage-download-docs.component.html",
  styleUrls: ["./manage-download-docs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageDownloadDocsComponent implements OnDestroy {
  private subscription = new Subscription();

  public me!: UserStructure | null;
  @Input() public usager!: UsagerFormModel;

  constructor(
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService
  ) {
    this.me = this.authService.currentUserValue;
  }

  public getCerfa(
    usagerRef: number,
    typeCerfa: CerfaDocType = "attestation"
  ): void {
    return this.documentService.attestation(usagerRef, typeCerfa);
  }

  public getDomifaCustomDoc(
    usagerRef: number,
    docType: StructureDocTypesAvailable
  ): void {
    this.subscription.add(
      this.documentService
        .getDomifaCustomDoc({
          usagerId: usagerRef,
          docType,
        })
        .subscribe({
          next: (blob: Blob) => {
            const newBlob = new Blob([blob], {
              type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            });
            saveAs(newBlob, docType + ".docx");
          },
          error: () => {
            this.toastService.error(
              "Impossible de télécharger le fichier pour l'instant"
            );
          },
        })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
