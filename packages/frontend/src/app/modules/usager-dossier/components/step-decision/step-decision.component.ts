import { Component, OnDestroy, OnInit, TemplateRef } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";

import { MatomoTracker } from "@ngx-matomo/tracker";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { CerfaDocType } from "src/_common/model/cerfa";

import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { BaseUsagerDossierPageComponent } from "../base-usager-dossier-page/base-usager-dossier-page.component";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import { DEFAULT_MODAL_OPTIONS } from "../../../../../_common/model";

@Component({
  providers: [
    NgbDateCustomParserFormatter,
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-step-decision",
  styleUrls: ["./step-decision.component.css"],
  templateUrl: "./step-decision.component.html",
})
export class StepDecisionComponent
  extends BaseUsagerDossierPageComponent
  implements OnInit, OnDestroy
{
  public isAdmin: boolean;
  public editInfos: boolean;
  public editEntretien: boolean;
  public editPJ: boolean;

  constructor(
    public authService: AuthService,
    public usagerDossierService: UsagerDossierService,
    public titleService: Title,
    public toastService: CustomToastService,
    public route: ActivatedRoute,
    public router: Router,
    public store: Store,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly modalService: NgbModal,
    private readonly matomo: MatomoTracker,
    private readonly documentService: DocumentService
  ) {
    super(
      authService,
      usagerDossierService,
      titleService,
      toastService,
      route,
      router,
      store
    );
    this.isAdmin = false;
    this.editInfos = false;
    this.editEntretien = false;
    this.editPJ = false;
    this.isAdmin =
      this.authService.currentUserValue?.role === "admin" ||
      this.authService.currentUserValue?.role === "responsable";
  }

  public setDecisionAttente() {
    this.subscription.add(
      this.usagerDecisionService
        .setDecision(this.usager.ref, { statut: "ATTENTE_DECISION" })
        .subscribe({
          next: () => {
            this.toastService.success("Décision enregistrée avec succès ! ");
          },
          error: () => {
            this.toastService.error("La décision n'a pas pu être enregistrée");
          },
        })
    );
  }

  public open(content: TemplateRef<NgbModalRef>) {
    this.modalService.open(content, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals() {
    this.modalService.dismissAll();
  }

  public getCerfa(typeCerfa: CerfaDocType) {
    return this.documentService.attestation(this.usager.ref, typeCerfa);
  }

  public printPage() {
    window.print();
    this.matomo.trackEvent(
      "tests",
      "impression_recapitulatif_decision",
      "null",
      1
    );
  }
}
