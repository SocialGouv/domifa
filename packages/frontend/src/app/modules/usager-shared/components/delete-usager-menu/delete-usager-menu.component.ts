import { UsagerFormModel } from "./../../interfaces/UsagerFormModel";
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";

import {
  DEFAULT_MODAL_OPTIONS,
  UserStructure,
} from "../../../../../_common/model";

import { CustomToastService } from "../../../shared/services/custom-toast.service";
import { UsagerDecisionService } from "../../services/usager-decision.service";
import { Decision } from "../../interfaces";
import { Subscription } from "rxjs";
import { USAGER_DECISION_STATUT_LABELS } from "@domifa/common";

@Component({
  styleUrls: ["./delete-usager-menu.component.css"],
  selector: "app-delete-usager-menu",
  templateUrl: "./delete-usager-menu.component.html",
})
export class DeleteUsagerMenuComponent implements OnInit, OnDestroy {
  @Input() public usager!: UsagerFormModel;
  @Input() public context!: "HISTORY" | "PROFIL";
  @Input() public me!: UserStructure;

  private subscription = new Subscription();
  public isFirstInstruction: boolean;
  public previousStatus: string;
  public loading: boolean;
  public isAdmin: boolean;

  constructor(
    private readonly router: Router,
    private readonly modalService: NgbModal,
    private readonly usagerDecisionService: UsagerDecisionService,
    private readonly toastService: CustomToastService
  ) {
    this.isAdmin = false;
    this.loading = false;
    this.isFirstInstruction = false;
    this.previousStatus = "";
  }

  public ngOnInit(): void {
    this.isAdmin = this.me?.role === "admin" || this.me?.role === "responsable";

    const hasOneHistorique = this.usager.historique.length === 1;
    this.isFirstInstruction =
      hasOneHistorique && this.usager.decision.statut === "INSTRUCTION";

    if (this.usager.historique.length > 1) {
      this.getPreviousStatus();
    }
  }

  public getPreviousStatus(): void {
    const historique: Decision[] = Object.assign([], this.usager.historique);
    historique.sort((a, b) => {
      return a.dateDecision.getTime() - b.dateDecision.getTime();
    });
    const statut = historique[historique.length - 2].statut;
    this.previousStatus = USAGER_DECISION_STATUT_LABELS[statut];
  }

  public open(content: TemplateRef<NgbModalRef>): void {
    this.modalService.open(content, DEFAULT_MODAL_OPTIONS);
  }

  public closeModals(): void {
    this.modalService.dismissAll();
  }

  public deleteDecision(): void {
    this.loading = true;
    this.subscription.add(
      this.usagerDecisionService.deleteDecision(this.usager.ref).subscribe({
        next: () => {
          this.toastService.success(
            "Demande de renouvellement supprimée avec succès"
          );

          setTimeout(() => {
            this.modalService.dismissAll();
            this.loading = false;

            const redirection =
              this.usager.decision.statut === "INSTRUCTION" ||
              this.usager.decision.statut === "ATTENTE_DECISION"
                ? "usager/" + this.usager.ref + "/edit/decision"
                : "profil/general/" + this.usager.ref;

            this.router.navigate([redirection]);
          }, 500);
        },
        error: () => {
          this.loading = false;
          this.toastService.error(
            "La demande de renouvellement n'a pas pu être supprimée"
          );
        },
      })
    );
  }

  public ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
