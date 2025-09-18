import {
  Component,
  Input,
  OnDestroy,
  TemplateRef,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";

import {
  DEFAULT_MODAL_OPTIONS,
  ETAPES_DEMANDE_URL,
  UsagerLight,
} from "../../../../../_common/model";

import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { Subscription } from "rxjs";
import { UserStructure, CerfaDocType } from "@domifa/common";

@Component({
  selector: "app-profil-head",
  templateUrl: "./profil-head.component.html",
  styleUrls: ["./profil-head.component.css"],
})
export class ProfilHeadComponent implements OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  @Input() public section!: string;

  private readonly subscription = new Subscription();

  public loading: boolean;
  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;

  @ViewChild("renewModal", { static: true })
  public renewModal!: TemplateRef<NgbModalRef>;

  public readonly CerfaDocType = CerfaDocType;

  constructor(
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly router: Router,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly documentService: DocumentService
  ) {
    this.loading = false;
  }

  public closeModals(): void {
    this.loading = false;
    this.modalService.dismissAll();
  }

  public goToDocuments(): void {
    if (this.me?.role === "facteur") {
      this.toastService.warning(
        "Vos droits ne vous permettent pas d'accéder à cette page"
      );
    }
  }

  public renouvellement(): void {
    this.loading = true;

    this.subscription.add(
      this.usagerDecisionService.renouvellement(this.usager).subscribe({
        next: (usager: UsagerLight) => {
          this.closeModals();
          this.toastService.success(
            "Votre demande a été enregistrée. Merci de remplir l'ensemble du dossier"
          );
          this.loading = false;
          this.router.navigate(["usager/" + usager.ref + "/edit"]);
        },
        error: () => {
          this.loading = false;
          this.toastService.error("Impossible d'enregistrer cette interaction");
        },
      })
    );
  }

  public openRenewModal(): void {
    this.modalService.open(this.renewModal, DEFAULT_MODAL_OPTIONS);
  }

  public getCerfa(typeCerfa: CerfaDocType): void {
    return this.documentService.getCerfa(this.usager.ref, typeCerfa);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
