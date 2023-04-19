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
  ETAPES_DEMANDE_URL,
  UsagerLight,
  UserStructure,
  UserStructureRole,
} from "../../../../../_common/model";

import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { CerfaDocType } from "src/_common/model/cerfa";
import { Subscription } from "rxjs";

@Component({
  selector: "app-profil-head",
  templateUrl: "./profil-head.component.html",
  styleUrls: ["./profil-head.component.css"],
})
export class ProfilHeadComponent implements OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public me!: UserStructure;
  @Input() public section!: string;

  private subscription = new Subscription();

  public loading: boolean;
  public today: Date;
  public readonly ETAPES_DEMANDE_URL = ETAPES_DEMANDE_URL;

  @ViewChild("renewModal", { static: true })
  public renewModal!: TemplateRef<NgbModalRef>;

  constructor(
    private readonly modalService: NgbModal,
    private readonly toastService: CustomToastService,
    private readonly router: Router,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly documentService: DocumentService
  ) {
    this.loading = false;
    this.today = new Date();
  }

  public closeModals(): void {
    this.loading = false;
    this.modalService.dismissAll();
  }

  public isRole(role: UserStructureRole): boolean {
    return this.me.role === role;
  }

  public renouvellement(): void {
    this.loading = true;

    this.subscription.add(
      this.usagerDecisionService.renouvellement(this.usager.ref).subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
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
    this.modalService.open(this.renewModal);
  }

  public getCerfa(typeCerfa: CerfaDocType): void {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }

  public ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
