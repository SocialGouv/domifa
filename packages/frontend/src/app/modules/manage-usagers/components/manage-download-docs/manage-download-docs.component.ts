import { AuthService } from "src/app/modules/shared/services/auth.service";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
} from "@angular/core";
import saveAs from "file-saver";
import { Subscription } from "rxjs";

import { CustomToastService } from "../../../shared/services";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerFormModel } from "../../../usager-shared/interfaces";
import {
  UserStructure,
  CerfaDocType,
  StructureDocTypesAvailable,
} from "@domifa/common";

@Component({
  selector: "app-manage-download-docs",
  templateUrl: "./manage-download-docs.component.html",
  styleUrls: ["./manage-download-docs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class ManageDownloadDocsComponent implements OnDestroy {
  private readonly subscription = new Subscription();

  public me!: UserStructure | null;
  @Input({ required: true }) public usager!: UsagerFormModel;

  public readonly CerfaDocType = CerfaDocType;
  public readonly StructureDocTypesAvailable = StructureDocTypesAvailable;

  public readonly faFilePdf = "file-pdf-2-line";
  public readonly faFileWord = "ri-file-word-2-line";
  public showMenu = false;

  private outsideClickListener?: (e: Event) => void;

  constructor(
    private readonly documentService: DocumentService,
    private readonly toastService: CustomToastService,
    private readonly authService: AuthService,
    private readonly elementRef: ElementRef,
    private readonly cd: ChangeDetectorRef
  ) {
    this.me = this.authService.currentUserValue;
  }

  public toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
    if (this.showMenu) {
      // Attacher après le tick courant pour ne pas capter le click qui ouvre.
      setTimeout(() => {
        this.outsideClickListener = (e: Event) => {
          if (!this.elementRef.nativeElement.contains(e.target as Node)) {
            this.showMenu = false;
            this.detachOutsideClick();
            this.cd.markForCheck();
          }
        };
        document.addEventListener("click", this.outsideClickListener);
      });
    } else {
      this.detachOutsideClick();
    }
  }

  public closeMenu(): void {
    this.showMenu = false;
    this.detachOutsideClick();
  }

  private detachOutsideClick(): void {
    if (this.outsideClickListener) {
      document.removeEventListener("click", this.outsideClickListener);
      this.outsideClickListener = undefined;
    }
  }

  public getCerfa(
    usagerRef: number,
    typeCerfa: CerfaDocType = CerfaDocType.attestation
  ): void {
    return this.documentService.getCerfa(usagerRef, typeCerfa);
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
            saveAs(newBlob, `${docType}.docx`);
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
    this.detachOutsideClick();
    this.subscription.unsubscribe();
  }
}
