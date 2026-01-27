import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
} from "@ng-bootstrap/ng-bootstrap";

import { MatomoTracker } from "ngx-matomo-client";
import { DsfrModalComponent } from "@edugouvfr/ngx-dsfr";

import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";
import { BaseUsagerDossierPageComponent } from "../base-usager-dossier-page/base-usager-dossier-page.component";
import { Title } from "@angular/platform-browser";
import { Store } from "@ngrx/store";
import {
  NgbDateCustomParserFormatter,
  CustomDatepickerI18n,
  AuthService,
  CustomToastService,
} from "../../../shared/services";
import { CerfaDocType } from "@domifa/common";
import { UsagerState } from "../../../../shared";

@Component({
  providers: [
    { provide: NgbDatepickerI18n, useClass: CustomDatepickerI18n },
    { provide: NgbDateParserFormatter, useClass: NgbDateCustomParserFormatter },
  ],
  selector: "app-step-decision",
  templateUrl: "./step-decision.component.html",
})
export class StepDecisionComponent
  extends BaseUsagerDossierPageComponent
  implements OnInit, OnDestroy
{
  @ViewChild("refusModal", { static: false })
  refusModal!: DsfrModalComponent;

  @ViewChild("confirmationModal", { static: false })
  confirmationModal!: DsfrModalComponent;

  @ViewChild("standbyModal", { static: false })
  standbyModal!: DsfrModalComponent;

  public isAdmin: boolean;
  public editInfos: boolean;
  public editContactDetails = false;
  public editEntretien: boolean;
  public editPJ: boolean;

  constructor(
    protected readonly authService: AuthService,
    protected readonly usagerDossierService: UsagerDossierService,
    protected readonly titleService: Title,
    protected readonly toastService: CustomToastService,
    protected readonly route: ActivatedRoute,
    protected readonly router: Router,
    protected readonly store: Store<UsagerState>,
    private readonly usagerDecisionService: UsagerDecisionService,
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
            this.toastService.success("Décision enregistrée avec succès !");
          },
          error: () => {
            this.toastService.error("La décision n'a pas pu être enregistrée");
          },
        })
    );
  }

  public open(modalType: "refus" | "confirmation" | "standby") {
    switch (modalType) {
      case "refus":
        this.refusModal.open();
        break;
      case "confirmation":
        this.confirmationModal.open();
        break;
      case "standby":
        this.standbyModal.open();
        break;
    }
  }

  public closeModals() {
    this.refusModal.close();
    this.confirmationModal.close();
    this.standbyModal.close();
  }

  public getCerfa(typeCerfa: CerfaDocType) {
    return this.documentService.getCerfa(this.usager.ref, typeCerfa);
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
