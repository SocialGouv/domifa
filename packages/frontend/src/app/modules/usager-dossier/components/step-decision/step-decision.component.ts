import { Component, OnInit, TemplateRef } from "@angular/core";

import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NgbDateParserFormatter,
  NgbDatepickerI18n,
  NgbModal,
  NgbModalRef,
} from "@ng-bootstrap/ng-bootstrap";

import { MatomoTracker } from "ngx-matomo";
import { CustomToastService } from "src/app/modules/shared/services/custom-toast.service";
import { AuthService } from "src/app/modules/shared/services/auth.service";
import { NgbDateCustomParserFormatter } from "src/app/modules/shared/services/date-formatter";
import { CustomDatepickerI18n } from "src/app/modules/shared/services/date-french";
import { UsagerLight, UserStructure } from "../../../../../_common/model";
import { CerfaDocType } from "src/_common/model/cerfa";

import { UsagerFormModel } from "../../../usager-shared/interfaces";
import { DocumentService } from "../../../usager-shared/services/document.service";
import { UsagerDecisionService } from "../../../usager-shared/services/usager-decision.service";
import { UsagerDossierService } from "../../services/usager-dossier.service";

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
export class StepDecisionComponent implements OnInit {
  public usager!: UsagerFormModel;
  public me!: UserStructure | null;

  public isAdmin: boolean;
  public editInfos: boolean;
  public editEntretien: boolean;
  public editPJ: boolean;

  constructor(
    private readonly authService: AuthService,
    private readonly usagerDossierService: UsagerDossierService,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly documentService: DocumentService,
    private readonly modalService: NgbModal,
    private readonly router: Router,
    private readonly toastService: CustomToastService,
    private readonly matomo: MatomoTracker,
    private readonly titleService: Title,
    private readonly route: ActivatedRoute
  ) {
    this.isAdmin = false;
    this.editInfos = false;
    this.editEntretien = false;

    this.editPJ = false;
  }

  public ngOnInit(): void {
    this.me = this.authService.currentUserValue;
    this.isAdmin = this.me?.role === "admin" || this.me?.role === "responsable";

    if (this.route.snapshot.params.id) {
      const id = this.route.snapshot.params.id;

      this.usagerDossierService.findOne(id).subscribe({
        next: (usager: UsagerLight) => {
          this.titleService.setTitle(
            "Décision sur la domiciliation de " +
              usager.nom +
              " " +
              usager.prenom
          );

          this.usager = new UsagerFormModel(usager);
        },
        error: () => {
          this.router.navigate(["404"]);
        },
      });
    } else {
      this.router.navigate(["404"]);
    }
  }

  public setDecisionAttente() {
    this.usagerDecisionService
      .setDecision(this.usager.ref, { statut: "ATTENTE_DECISION" })
      .subscribe({
        next: (usager: UsagerLight) => {
          this.usager = new UsagerFormModel(usager);
          this.toastService.success("Décision enregistrée avec succès ! ");
        },
        error: () => {
          this.toastService.error("La décision n'a pas pu être enregistrée");
        },
      });
  }

  public open(content: TemplateRef<NgbModalRef>) {
    this.modalService.open(content);
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
